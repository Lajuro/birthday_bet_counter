'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppSettings, getClosestGuess, getNextGuesses } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { BirthGuess, AppSettings } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Eye, ShieldAlert, CalendarClock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Interface para o resultado do getClosestGuess
interface ClosestGuessResult {
  guess: BirthGuess | null;
  difference?: string;
  ranking?: number;
}

// Interface para os countdowns calculados
interface CountdownData {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

// Interface para o countup da idade do bebê
interface BabyAgeData {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  progress?: number;
}

// Interface para erros do Firebase
interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

// Configurações padrão da aplicação caso ocorra erro
const defaultAppSettings: AppSettings = {
  babyName: 'Chloe',
  expectedBirthDate: Timestamp.now(),
  actualBirthDate: undefined,
  lastMenstruationDate: undefined,
  showCountdown: true,
  allowGuesses: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};

export default function Home() {
  const { user, isLoading } = useAuth();
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [closestGuess, setClosestGuess] = useState<ClosestGuessResult | null>(null);
  const [nextGuesses, setNextGuesses] = useState<BirthGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<{[key: string]: CountdownData}>({}); 
  const [error, setError] = useState<string | null>(null);
  const [babyAge, setBabyAge] = useState<BabyAgeData | null>(null);
  const [gestationalAge, setGestationalAge] = useState<BabyAgeData | null>(null);
  const [expectedBirthCountdown, setExpectedBirthCountdown] = useState<CountdownData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar configurações do app
        const settings = await getAppSettings();
        if (settings) {
          setAppSettings(settings);
        }

        // Buscar palpite mais próximo
        const closest = await getClosestGuess();
        if (closest) {
          setClosestGuess(closest);
        }
        
        // Buscar próximos palpites
        const nextThreeGuesses = await getNextGuesses(3);
        if (Array.isArray(nextThreeGuesses)) {
          setNextGuesses(nextThreeGuesses);
        }
        
        // Limpar qualquer erro anterior se tudo deu certo
        setError(null);
      } catch (error: unknown) {
        console.error('Erro ao carregar dados:', error);
        
        // Verificar se é um erro de permissão do Firebase
        const fbError = error as FirebaseError;
        if (fbError && fbError.code === 'permission-denied') {
          setError('acesso_negado');
          toast.error('Erro de permissão', {
            description: 'Você não tem permissão para acessar estes dados. Faça login para continuar.',
          });
        } else {
          setError('erro_geral');
          toast.error('Erro ao carregar dados', {
            description: 'Não foi possível carregar as informações. Tente novamente mais tarde.',
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calcular countdown para cada palpite e idade do bebê (countup) se já nasceu
  useEffect(() => {
    if (!appSettings) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns: {[key: string]: CountdownData} = {};
      
      // Calcular countdown para a data esperada de nascimento
      if (appSettings.expectedBirthDate && appSettings.expectedBirthDate.seconds && !appSettings.actualBirthDate) {
        const expectedDate = new Date(appSettings.expectedBirthDate.seconds * 1000);
        const difference = expectedDate.getTime() - now.getTime();
        
        if (difference <= 0) {
          setExpectedBirthCountdown({ weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 });
        } else {
          // Calcular progresso
          const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
          const startDate = new Date(expectedDate.getTime() - totalWaitDuration);
          const totalDuration = expectedDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          
          // Calcular tempo restante
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setExpectedBirthCountdown({ weeks, days, hours, minutes, seconds, progress });
        }
      } else {
        setExpectedBirthCountdown(null);
      }
      
      // Calcular idade do bebê (countup) se já nasceu
      if (appSettings.actualBirthDate && appSettings.actualBirthDate.seconds) {
        const birthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
        const difference = now.getTime() - birthDate.getTime();
        
        if (difference > 0) {
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setBabyAge({ weeks, days, hours, minutes, seconds, totalDays });
        }
      } else {
        setBabyAge(null);
      }
      
      // Calcular idade gestacional com base na DUM (lastMenstruationDate)
      if (appSettings.lastMenstruationDate && appSettings.lastMenstruationDate.seconds) {
        const dumDate = new Date(appSettings.lastMenstruationDate.seconds * 1000);
        const difference = now.getTime() - dumDate.getTime();
        
        if (difference > 0) {
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          // Calcular o progresso da idade gestacional (considerando 40 semanas como 100%)
          const gestacaoCompleta = 40 * 7; // 40 semanas em dias
          const progress = Math.min(100, (totalDays / gestacaoCompleta) * 100);
          
          setGestationalAge({ weeks, days, hours, minutes, seconds, totalDays, progress });
        }
      } else {
        setGestationalAge(null);
      }
      
      // Calcular para o palpite mais próximo
      if (closestGuess?.guess) {
        try {
          const targetDate = new Date(closestGuess.guess.guessDate.seconds * 1000);
          const difference = targetDate.getTime() - now.getTime();
          
          if (difference <= 0) {
            newCountdowns[closestGuess.guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 };
          } else {
            // Calcular progresso (considerando que o período total de espera é de 280 dias = 40 semanas)
            const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
            const startDate = new Date(targetDate.getTime() - totalWaitDuration);
            const totalDuration = targetDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            
            // Calcular tempo restante
            const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            newCountdowns[closestGuess.guess.id] = { weeks, days, hours, minutes, seconds, progress };
          }
        } catch (error) {
          console.error("Erro ao calcular countdown para palpite mais próximo:", error);
          newCountdowns[closestGuess.guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 };
        }
      }
      
      // Calcular para os próximos palpites
      nextGuesses.forEach(guess => {
        try {
          if (!guess || !guess.guessDate || !guess.guessDate.seconds) {
            console.warn("Palpite com formato inválido:", guess);
            return;
          }
          
          const targetDate = new Date(guess.guessDate.seconds * 1000);
          const difference = targetDate.getTime() - now.getTime();
          
          if (difference <= 0) {
            newCountdowns[guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 };
          } else {
            // Calcular progresso
            const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
            const startDate = new Date(targetDate.getTime() - totalWaitDuration);
            const totalDuration = targetDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            
            // Calcular tempo restante
            const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            newCountdowns[guess.id] = { weeks, days, hours, minutes, seconds, progress };
          }
        } catch (error) {
          console.error("Erro ao calcular countdown para palpite:", guess.id, error);
          if (guess && guess.id) {
            newCountdowns[guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 };
          }
        }
      });
      
      setCountdowns(newCountdowns);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [closestGuess, nextGuesses, appSettings]);

  // Função para renderizar um componente de contagem genérico (usado tanto para countdowns quanto para countup)
  const renderTimeDisplay = (data: CountdownData | BabyAgeData, title: string, subtitle?: string, isMain = false) => {
    if (!data) return null;
    
    return (
      <div className={`${isMain ? 'p-4' : 'p-3'} rounded-lg bg-card border border-border shadow-sm h-full`}>
        <div className="text-center mb-2">
          <h3 className={`${isMain ? 'text-xl' : 'text-lg'} font-bold text-primary mb-1`}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-muted-foreground text-xs">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-center mb-2">
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{data.weeks}</span>
            <span className="text-[10px] text-muted-foreground">Sem</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{data.days}</span>
            <span className="text-[10px] text-muted-foreground">Dias</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{data.hours}</span>
            <span className="text-[10px] text-muted-foreground">Hrs</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{data.minutes}</span>
            <span className="text-[10px] text-muted-foreground">Min</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{data.seconds}</span>
            <span className="text-[10px] text-muted-foreground">Seg</span>
          </div>
        </div>
        
        {'progress' in data && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progresso</span>
              <span>{Math.round(data.progress || 0)}%</span>
            </div>
            <Progress value={data.progress || 0} className={isMain ? "h-2" : "h-1.5"} />
          </div>
        )}
        
        {'totalDays' in data && (
          <p className="text-center text-xs text-muted-foreground mt-1">
            Total: {data.totalDays} dias ({data.weeks} sem e {data.days} d)
          </p>
        )}
      </div>
    );
  };

  // Função para renderizar o contador de um palpite
  const renderCountdown = (guess: BirthGuess, isMain = false) => {
    const countdown = countdowns[guess.id];
    if (!countdown) return null;
    
    const subtitle = `Palpite: ${new Date(guess.guessDate.seconds * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
    
    return (
      <div className={`${isMain ? 'p-4' : 'p-3'} rounded-lg bg-card border border-border shadow-sm h-full`}>
        <div className="text-center mb-2">
          <h3 className={`${isMain ? 'text-xl' : 'text-lg'} font-bold text-primary mb-0.5 truncate`}>
            {guess.userName}
          </h3>
          <p className="text-muted-foreground text-xs">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-center mb-2">
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{countdown.weeks}</span>
            <span className="text-[10px] text-muted-foreground">Sem</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{countdown.days}</span>
            <span className="text-[10px] text-muted-foreground">Dias</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{countdown.hours}</span>
            <span className="text-[10px] text-muted-foreground">Hrs</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{countdown.minutes}</span>
            <span className="text-[10px] text-muted-foreground">Min</span>
          </div>
          <div className="flex flex-col">
            <span className={`${isMain ? 'text-3xl' : 'text-xl'} font-bold`}>{countdown.seconds}</span>
            <span className="text-[10px] text-muted-foreground">Seg</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{Math.round(countdown.progress)}%</span>
          </div>
          <Progress value={countdown.progress} className={isMain ? "h-2" : "h-1.5"} />
        </div>
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error === 'acesso_negado') {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Contador de Palpites
          </h1>
          <p className="text-lg text-muted-foreground">
            Nascimento da {appSettings?.babyName || 'Chloe'}
          </p>
        </header>
        
        <Card className="w-full max-w-md mx-auto bg-card/50">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Para visualizar os palpites e a contagem regressiva, você precisa estar logado no sistema.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/admin/login" passHref>
                <Button size="lg">Entrar para participar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error === 'erro_geral' || (!closestGuess?.guess && nextGuesses.length === 0)) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Contador de Palpites
          </h1>
          <p className="text-lg text-muted-foreground">
            Nascimento da {appSettings?.babyName || 'Chloe'}
          </p>
        </header>
        
        <Card className="w-full max-w-md mx-auto bg-card/50">
          <CardHeader className="text-center">
            <CalendarClock className="w-12 h-12 mx-auto text-primary/70 mb-2" />
            <CardTitle className="text-xl">Ainda não há palpites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {error === 'erro_geral' 
                ? 'Não foi possível carregar os dados dos palpites. Por favor, tente novamente mais tarde.'
                : 'Seja o primeiro a registrar um palpite para o nascimento da Chloe!'}
            </p>
            <div className="flex justify-center mt-4">
              {error === 'erro_geral' ? (
                <Button size="lg" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              ) : (
                <Link href="/admin" passHref>
                  <Button size="lg">Fazer meu palpite</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const babyBorn = appSettings?.actualBirthDate !== null && appSettings?.actualBirthDate !== undefined;
  
  return (
    <main className="flex min-h-screen flex-col items-center p-2 pt-6 md:p-8">
      <header className="mb-4 md:mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-1">
          Contador de Palpites
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Nascimento da {appSettings?.babyName || 'Chloe'}
        </p>
      </header>

      {babyBorn ? (
        // Exibição quando o bebê já nasceu
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <Card className="w-full bg-primary/5 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xl text-center text-primary">
                {appSettings?.babyName || 'Chloe'} já nasceu!
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="space-y-4">
                <p className="text-center font-medium text-sm">
                  Data de nascimento: {appSettings?.actualBirthDate && appSettings.actualBirthDate.seconds ? 
                    new Date(appSettings.actualBirthDate.seconds * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }) : 'Data não definida'}
                </p>
                
                {/* Countup da idade do bebê */}
                {babyAge && (
                  <div className="mt-4">
                    {renderTimeDisplay(
                      babyAge, 
                      `Idade da ${appSettings?.babyName || 'Chloe'}`, 
                      undefined, 
                      true
                    )}
                  </div>
                )}
                
                {closestGuess?.guess && (
                  <div className="mt-3 p-4 bg-card rounded-lg shadow-sm">
                    <h3 className="text-center font-bold text-primary text-lg mb-2">Ganhador do palpite</h3>
                    <p className="text-center font-medium text-xl">{closestGuess.guess.userName}</p>
                    <p className="text-center text-muted-foreground text-sm mt-1">
                      Palpitou: {closestGuess.guess.guessDate && closestGuess.guess.guessDate.seconds ? 
                        new Date(closestGuess.guess.guessDate.seconds * 1000).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }) : '-'}
                    </p>
                    {closestGuess.difference && (
                      <div className="mt-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          Diferença: {closestGuess.difference}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Exibição quando o bebê ainda não nasceu
        <div className="w-full max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Seção superior: Countdown e Idade Gestacional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Countdown para data esperada */}
            {expectedBirthCountdown && (
              <div>
                {renderTimeDisplay(
                  expectedBirthCountdown, 
                  "Contagem Regressiva", 
                  `Nascimento: ${appSettings?.expectedBirthDate ? 
                    new Date(appSettings.expectedBirthDate.seconds * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    }) : 'Não definida'}`,
                  true
                )}
              </div>
            )}
            
            {/* Idade Gestacional (baseada na DUM) */}
            {gestationalAge && appSettings?.lastMenstruationDate && (
              <div>
                {renderTimeDisplay(
                  gestationalAge, 
                  "Idade Gestacional", 
                  `DUM: ${new Date(appSettings.lastMenstruationDate.seconds * 1000).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}`,
                  true
                )}
              </div>
            )}
          </div>
          
          {/* Palpite mais próximo em destaque */}
          {closestGuess?.guess && (
            <div>
              <h2 className="text-lg font-bold text-center mb-2 text-primary">Palpite Mais Próximo</h2>
              {renderCountdown(closestGuess.guess, true)}
            </div>
          )}
          
          {/* Próximos palpites */}
          {nextGuesses.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-center mb-1 text-primary">Próximos Palpites</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {nextGuesses.map((guess) => (
                  <div key={guess.id}>
                    {renderCountdown(guess)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botão para ver todos os palpites */}
          <div className="flex justify-center mt-8">
            <Link href="/guesses" passHref>
              <Button variant="outline" size="lg" className="gap-2">
                <Eye className="h-4 w-4" />
                Ver todos os palpites
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      <div className="mt-12">
        {!user ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Faça seu palpite</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/admin/login" passHref>
                <Button size="lg">Entrar para participar</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Gerenciar palpites</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/admin" passHref>
                <Button size="lg">Acessar área administrativa</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
