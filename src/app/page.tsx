'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppSettings, getClosestGuess, getNextGuesses } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { BirthGuess, AppSettings } from '@/types';
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
  const renderTimeDisplay = (data: CountdownData | BabyAgeData, title: string, subtitle?: string, isMain = false, type: 'gestational' | 'countdown' | 'guess' = 'countdown') => {
    if (!data) return null;
    
    // Definir classes e cores com base no tipo
    let cardClasses = "rounded-lg border shadow-sm transition-all duration-300 overflow-hidden h-full";
    const bgGradient = "bg-white dark:bg-slate-900";
    let borderColor = "border-slate-200 dark:border-slate-800";
    let titleColor = "text-purple-600 dark:text-purple-400";
    const subtitleColor = "text-slate-500 dark:text-slate-400";
    let numberColor = "text-purple-600 dark:text-purple-400";
    const labelColor = "text-slate-500 dark:text-slate-400";
    let progressColors = "from-purple-500 to-indigo-500";
    let pillColor = "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
    
    // Ajustar estilos baseados no tipo
    if (type === 'gestational') {
      borderColor = "border-emerald-200 dark:border-emerald-800/60";
      titleColor = "text-emerald-600 dark:text-emerald-400";
      numberColor = "text-emerald-600 dark:text-emerald-400";
      progressColors = "from-emerald-500 to-teal-500";
      pillColor = "bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
    } else if (type === 'countdown') {
      borderColor = "border-indigo-200 dark:border-indigo-800/60";
      titleColor = "text-indigo-600 dark:text-indigo-400";
      numberColor = "text-indigo-600 dark:text-indigo-400";
      progressColors = "from-indigo-500 to-blue-500";
      pillColor = "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
    } else if (type === 'guess') {
      borderColor = "border-indigo-200 dark:border-indigo-800/60";
      titleColor = "text-indigo-600 dark:text-indigo-400";
      numberColor = "text-indigo-600 dark:text-indigo-400";
      progressColors = "from-indigo-500 to-purple-500";
      pillColor = "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
    }
    
    if (isMain) {
      cardClasses += " hover:shadow-md hover:-translate-y-1";
    }
    
    // Para contagens de tempo, determinar se mostramos semanas ou apenas dias
    const showWeeks = type === 'gestational';
    const gridCols = showWeeks ? "grid-cols-5" : "grid-cols-4";
    
    // Definir tamanhos com base em se é um card principal ou secundário
    // Cards de contagem regressiva e idade gestacional serão menores
    const headerPadding = isMain ? "p-3 sm:p-4" : "p-2";
    const contentPadding = isMain ? "p-3 sm:p-4" : "p-2";
    const numberSize = isMain ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";
    const titleSize = isMain ? "text-lg sm:text-xl" : "text-sm";
    const subtitleSize = isMain ? "text-sm" : "text-xs";
    const pillPadding = isMain ? "px-3 py-2" : "px-2 py-1.5";
    
    return (
      <div className={`${cardClasses} ${borderColor} ${bgGradient}`}>
        {/* Cabeçalho do card */}
        <div className={`${headerPadding} border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex flex-col">
            <h3 className={`font-bold ${titleColor} ${titleSize}`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`${subtitleSize} ${subtitleColor} mt-0.5`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Conteúdo do card */}
        <div className={contentPadding}>
          {/* Contadores de tempo */}
          <div className={`grid ${gridCols} gap-1.5 text-center`}>
            {showWeeks && (
              <div className="flex flex-col items-center justify-center">
                <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                  <span className={`${numberSize} font-bold ${numberColor}`}>{data.weeks}</span>
                  <span className={`text-xs font-medium ${labelColor}`}>Sem</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>
                  {showWeeks ? data.days : Math.floor(data.weeks * 7 + data.days)}
                </span>
                <span className={`text-xs font-medium ${labelColor}`}>Dias</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{data.hours}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Hrs</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{data.minutes}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Min</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{data.seconds}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Seg</span>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          {'progress' in data && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className={labelColor}>Progresso</span>
                <span className={titleColor}>{Math.round(data.progress || 0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${progressColors} rounded-full transition-all duration-500 ease-in-out`}
                  style={{ width: `${data.progress || 0}%` }} 
                />
              </div>
            </div>
          )}
          
          {/* Informação adicional - só mostra nos cards principais ou quando não há outra informação */}
          {'totalDays' in data && showWeeks && isMain && (
            <div className={`mt-2 ${pillColor} text-center rounded-md py-1 px-2 text-xs font-medium`}>
              Total: {data.totalDays} dias ({data.weeks} semanas e {data.days} dias)
            </div>
          )}
        </div>
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
    
    // Calcular dias totais (semanas * 7 + dias)
    const totalDays = countdown.weeks * 7 + countdown.days;
    
    // Definir estilos para o card de palpites
    const cardClasses = `rounded-lg border shadow-md transition-all duration-300 overflow-hidden h-full
                        ${isMain 
                          ? 'border-indigo-300 dark:border-indigo-700 hover:shadow-xl hover:-translate-y-1' 
                          : 'border-indigo-200 dark:border-indigo-800/60'}`;
    const titleColor = "text-indigo-600 dark:text-indigo-400";
    const subtitleColor = "text-slate-500 dark:text-slate-400";
    const numberColor = "text-indigo-600 dark:text-indigo-400";
    const labelColor = "text-slate-500 dark:text-slate-400";
    const pillColor = "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
    
    // Definir tamanhos com base em se é um card principal ou secundário
    const headerPadding = isMain ? "p-3 sm:p-4" : "p-2";
    const contentPadding = isMain ? "p-3 sm:p-4" : "p-2";
    const numberSize = isMain ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";
    const titleSize = isMain ? "text-lg sm:text-xl" : "text-sm";
    const subtitleSize = isMain ? "text-sm" : "text-xs";
    const pillPadding = isMain ? "px-3 py-2" : "px-2 py-1.5";
    
    // Definir gradiente de fundo para o card principal (palpite mais próximo)
    const bgGradient = isMain 
      ? "bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30" 
      : "bg-white dark:bg-slate-900";
    
    return (
      <div className={`${cardClasses} ${bgGradient}`}>
        {/* Cabeçalho do card */}
        <div className={`${headerPadding} border-b border-indigo-200 dark:border-indigo-800/60`}>
          <div className="flex flex-col">
            <h3 className={`font-bold ${titleColor} ${titleSize} truncate`}>
              {guess.userName} {isMain && <span className="ml-1 text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">Mais próximo</span>}
            </h3>
            <p className={`${subtitleSize} ${subtitleColor} mt-0.5`}>
              {subtitle}
            </p>
          </div>
        </div>
        
        {/* Conteúdo do card */}
        <div className={contentPadding}>
          {/* Contadores de tempo */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{totalDays}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Dias</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{countdown.hours}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Hrs</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{countdown.minutes}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Min</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full`}>
                <span className={`${numberSize} font-bold ${numberColor}`}>{countdown.seconds}</span>
                <span className={`text-xs font-medium ${labelColor}`}>Seg</span>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className={labelColor}>Progresso</span>
              <span className={titleColor}>{Math.round(countdown.progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${countdown.progress}%` }} 
              />
            </div>
          </div>
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
    <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-8">
      <header className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-indigo-700 dark:text-indigo-400 mb-2 animate-fade-in">
          Contador de Palpites
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
          Nascimento da {appSettings?.babyName || 'Chloe'}
        </p>
      </header>

      {babyBorn ? (
        // Exibição quando o bebê já nasceu
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <Card className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 shadow-lg border-indigo-200 dark:border-indigo-800">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-2xl text-center text-indigo-700 dark:text-indigo-400">
                {appSettings?.babyName || 'Chloe'} já nasceu!
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6 px-6">
              <div className="space-y-6">
                <p className="text-center font-medium text-base text-slate-700 dark:text-slate-300">
                  Data de nascimento: {appSettings?.actualBirthDate && appSettings.actualBirthDate.seconds ? 
                    new Date(appSettings.actualBirthDate.seconds * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }) : 'Data não definida'}
                </p>
                
                {/* Countup da idade do bebê */}
                {babyAge && (
                  <div className="mt-6">
                    {renderTimeDisplay(
                      babyAge, 
                      `Idade da ${appSettings?.babyName || 'Chloe'}`, 
                      undefined, 
                      true,
                      'gestational'
                    )}
                  </div>
                )}
                
                {closestGuess?.guess && (
                  <div className="mt-6 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <h3 className="text-center font-bold text-indigo-600 dark:text-indigo-400 text-xl mb-3">Ganhador do palpite</h3>
                    <p className="text-center font-bold text-2xl text-slate-900 dark:text-white">{closestGuess.guess.userName}</p>
                    <p className="text-center text-slate-600 dark:text-slate-400 text-base mt-2">
                      Palpitou: {closestGuess.guess.guessDate && closestGuess.guess.guessDate.seconds ? 
                        new Date(closestGuess.guess.guessDate.seconds * 1000).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }) : '-'}
                    </p>
                    {closestGuess.difference && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
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
          {/* Seção superior: Countdown e Idade Gestacional - cards menores e com a mesma altura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
            {/* Countdown para data esperada */}
            {expectedBirthCountdown && (
              <div className="transform transition-all duration-300 h-full">
                {renderTimeDisplay(
                  expectedBirthCountdown, 
                  "Contagem Regressiva", 
                  `Nascimento: ${appSettings?.expectedBirthDate ? 
                    new Date(appSettings.expectedBirthDate.seconds * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    }) : 'Não definida'}`,
                  false,
                  'countdown'
                )}
              </div>
            )}
            
            {/* Idade Gestacional (baseada na DUM) */}
            {gestationalAge && appSettings?.lastMenstruationDate && (
              <div className="transform transition-all duration-300 h-full">
                {renderTimeDisplay(
                  gestationalAge, 
                  "Idade Gestacional", 
                  `DUM: ${new Date(appSettings.lastMenstruationDate.seconds * 1000).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}`,
                  false,
                  'gestational'
                )}
              </div>
            )}
          </div>
          
          {/* Palpite mais próximo em destaque - card maior e mais destacado */}
          {closestGuess?.guess && (
            <div className="mt-8">
              <div className="transform transition-all duration-300">
                <div className="max-w-4xl mx-auto relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-400 dark:from-indigo-700 dark:to-purple-600 rounded-xl blur-sm opacity-50"></div>
                  <div className="relative">
                    {renderCountdown(closestGuess.guess, true)}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Próximos palpites */}
          {nextGuesses.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                nextGuesses.length === 1 ? 'md:grid-cols-1 max-w-md' :
                nextGuesses.length === 2 ? 'md:grid-cols-2 max-w-2xl' :
                nextGuesses.length === 3 ? 'md:grid-cols-3 max-w-4xl' :
                'md:grid-cols-4'
              } gap-4 mx-auto`}>
                {nextGuesses.slice(0, 4).map((guess) => (
                  <div key={guess.id} className="transform hover:-translate-y-1 transition-all duration-300">
                    {renderCountdown(guess)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botão para ver todos os palpites */}
          <div className="flex justify-center mt-10">
            <Link href="/guesses" passHref>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-800 dark:hover:text-indigo-300 shadow-md hover:shadow-lg transition-all"
              >
                <Eye className="h-5 w-5" />
                Ver todos os palpites
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      <div className="mt-14 mb-8 w-full max-w-md">
        {!user ? (
          <Card className="bg-white dark:bg-slate-900 shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">Faça seu palpite</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/admin/login" passHref>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Entrar para participar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-slate-900 shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">Gerenciar palpites</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/admin" passHref>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Acessar área administrativa
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
