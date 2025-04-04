'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppSettings, getClosestGuess, getNextGuesses, getAllGuesses } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { BirthGuess, AppSettings } from '@/types';
import { Eye, ShieldAlert, CalendarClock, PlusIcon, InfoIcon, TrophyIcon, UserRound } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { GuessForm } from '@/components/bets/guess-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { debug } from '@/lib/debug';

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
  guessPrice: 10, // Preço padrão de cada palpite em reais
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};

export default function Home() {
  const { isLoading, user } = useAuth();
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [closestGuess, setClosestGuess] = useState<ClosestGuessResult | null>(null);
  const [nextGuesses, setNextGuesses] = useState<BirthGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<{[key: string]: CountdownData}>({}); 
  const [error, setError] = useState<string | null>(null);
  const [babyAge, setBabyAge] = useState<BabyAgeData | null>(null);
  const [gestationalAge, setGestationalAge] = useState<BabyAgeData | null>(null);
  const [expectedBirthCountdown, setExpectedBirthCountdown] = useState<CountdownData | null>(null);
  const [guessFormOpen, setGuessFormOpen] = useState(false);
  const [totalGuessCount, setTotalGuessCount] = useState(0);

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
        
        // Buscar contagem total de palpites
        const allGuesses = await getAllGuesses();
        setTotalGuessCount(allGuesses.length);
        
        // Limpar qualquer erro anterior se tudo deu certo
        setError(null);
      } catch (error: unknown) {
        debug.error('app', 'Erro ao carregar dados:', error);
        
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

  const refreshData = async () => {
    try {
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
    } catch (error) {
      debug.error('app', 'Erro ao atualizar dados:', error);
    }
  };

  // Calcular countdown para cada palpite e idade do bebê (countup) se já nasceu
  useEffect(() => {
    if (!appSettings) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns: {[key: string]: CountdownData} = {};
      
      // Verificar se temos a data da última menstruação com todas as propriedades necessárias
      const hasDUM = appSettings?.lastMenstruationDate !== undefined && 
                    appSettings?.lastMenstruationDate !== null && 
                    typeof appSettings?.lastMenstruationDate?.seconds === 'number';
      
      // Só acessar a propriedade seconds se tivermos certeza que ela existe
      const dumDate = hasDUM && appSettings?.lastMenstruationDate?.seconds 
          ? new Date(appSettings.lastMenstruationDate.seconds * 1000) 
          : null;
      
      // Calcular countdown para a data esperada de nascimento
      if (appSettings.expectedBirthDate && appSettings.expectedBirthDate.seconds && !appSettings.actualBirthDate) {
        const expectedDate = new Date(appSettings.expectedBirthDate.seconds * 1000);
        const difference = expectedDate.getTime() - now.getTime();
        
        if (difference <= 0) {
          setExpectedBirthCountdown({ weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 });
        } else {
          // Calcular progresso - usando DUM como data inicial
          let progress = 0;
          
          if (hasDUM && dumDate) {
            // Usar a DUM real como data de início
            const totalDuration = expectedDate.getTime() - dumDate.getTime();
            const elapsed = now.getTime() - dumDate.getTime();
            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          } else {
            // Fallback para o método anterior caso não tenha DUM
            const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
            const startDate = new Date(expectedDate.getTime() - totalWaitDuration);
            const totalDuration = expectedDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          }
          
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
      if (hasDUM && dumDate) {
        const difference = now.getTime() - dumDate.getTime();
        
        if (difference > 0) {
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          // Calcular o progresso da idade gestacional usando a DUM até a data prevista
          let progress = 0;
          
          if (appSettings.expectedBirthDate && appSettings.expectedBirthDate.seconds) {
            const expectedDate = new Date(appSettings.expectedBirthDate.seconds * 1000);
            const totalDuration = expectedDate.getTime() - dumDate.getTime();
            progress = Math.min(100, Math.max(0, (difference / totalDuration) * 100));
          } else {
            // Fallback para método anterior se não tiver data prevista
            const gestacaoCompleta = 40 * 7; // 40 semanas em dias
            progress = Math.min(100, (totalDays / gestacaoCompleta) * 100);
          }
          
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
            // Calcular progresso usando a DUM como data inicial
            let progress = 0;
            
            if (hasDUM && dumDate) {
              // Usar a DUM real como data de início
              const totalDuration = targetDate.getTime() - dumDate.getTime();
              const elapsed = now.getTime() - dumDate.getTime();
              progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            } else {
              // Fallback para o método anterior caso não tenha DUM
              const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
              const startDate = new Date(targetDate.getTime() - totalWaitDuration);
              const totalDuration = targetDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            }
            
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
          debug.error('app', 'Erro ao calcular countdown para palpite mais próximo:', error);
          newCountdowns[closestGuess.guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 };
        }
      }
      
      // Calcular para os próximos palpites
      nextGuesses.forEach(guess => {
        try {
          if (!guess || !guess.guessDate || !guess.guessDate.seconds) {
            debug.warn('app', 'Palpite com formato inválido:', guess);
            return;
          }
          
          const targetDate = new Date(guess.guessDate.seconds * 1000);
          const difference = targetDate.getTime() - now.getTime();
          
          if (difference <= 0) {
            newCountdowns[guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 };
          } else {
            // Calcular progresso usando a DUM como data inicial
            let progress = 0;
            
            if (hasDUM && dumDate) {
              // Usar a DUM real como data de início
              const totalDuration = targetDate.getTime() - dumDate.getTime();
              const elapsed = now.getTime() - dumDate.getTime();
              progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            } else {
              // Fallback para o método anterior caso não tenha DUM
              const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
              const startDate = new Date(targetDate.getTime() - totalWaitDuration);
              const totalDuration = targetDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            }
            
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
          debug.error('app', 'Erro ao calcular countdown para palpite:', guess.id, error);
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
          <div className={`grid ${gridCols} gap-2 text-center`}>
            {showWeeks && (
              <div className="flex flex-col items-center justify-center">
                <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                  <span className={`${numberSize} font-bold ${numberColor} relative`}>{data.weeks}</span>
                  <span className={`text-xs font-medium ${labelColor} relative`}>Semanas</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>
                  {showWeeks ? data.days : Math.floor(data.weeks * 7 + data.days)}
                </span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Dias</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{data.hours}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Horas</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{data.minutes}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Min</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{data.seconds}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Seg</span>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          {'progress' in data && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className={`${labelColor} font-semibold`}>Progresso</span>
                <span className={`${titleColor} bg-indigo-100/50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full font-semibold`}>{Math.round(data.progress || 0)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100/70 dark:bg-slate-800/70 rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  className={`h-full bg-gradient-to-r ${progressColors} rounded-full transition-all duration-500 ease-in-out relative`}
                  style={{ width: `${data.progress || 0}%` }} 
                >
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 dark:bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Informação adicional - só mostra nos cards principais ou quando não há outra informação */}
          {'totalDays' in data && showWeeks && isMain && (
            <div className={`mt-3 ${pillColor} text-center rounded-md py-1.5 px-3 text-xs font-medium shadow-sm border border-indigo-200/70 dark:border-indigo-800/30 backdrop-blur-sm`}>
              <span className="text-indigo-900 dark:text-indigo-300 font-semibold">Total:</span> {data.totalDays} dias ({data.weeks} semanas e {data.days} dias)
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
      ? "bg-gradient-to-br from-white to-indigo-50 dark:from-indigo-950/50 dark:to-indigo-950/50" 
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
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{totalDays}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Dias</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{countdown.hours}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Horas</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative`}>{countdown.minutes}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Min</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span className={`${numberSize} font-bold ${numberColor} relative ${isMain ? 'group-hover:animate-pulse' : ''}`}>{countdown.seconds}</span>
                <span className={`text-xs font-medium ${labelColor} relative`}>Seg</span>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className={`${labelColor} font-semibold`}>Progresso</span>
              <span className={`${titleColor} bg-indigo-100/50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full font-semibold`}>{Math.round(countdown.progress)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100/70 dark:bg-slate-800/70 rounded-full overflow-hidden shadow-inner p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out relative"
                style={{ width: `${countdown.progress || 0}%` }} 
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 dark:bg-white/10 rounded-full"></div>
              </div>
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
            <p className="text-center font-medium text-base text-slate-700 dark:text-slate-300">
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

  const babyBorn = appSettings?.actualBirthDate !== undefined && appSettings?.actualBirthDate !== null;
  
  const allowGuesses = !babyBorn && appSettings?.allowGuesses !== false;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col font-sans">
      {/* Container principal com padding superior para separar da navbar */}
      {/* Botão fixo para adicionar palpite */}
      {allowGuesses && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => setGuessFormOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
            size="icon"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      )}

      <header className="pt-12 md:pt-16 lg:pt-20 pb-8 md:pb-10 px-4 text-center relative overflow-hidden">
        {/* Efeito decorativo de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-72 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[100%] blur-3xl -z-10 transform -translate-y-1/3"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-2 animate-fade-in">
          Contador de Palpites
        </h1>
        
        <div className="mt-5 mb-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight inline-block">
            <span className="bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 px-5 py-1.5 rounded-full shadow-sm border border-indigo-300/30 dark:border-indigo-700/30">
              {appSettings?.babyName || 'Chloe'}
            </span>
          </h2>
        </div>

        {/* Divider decorativo */}
        <div className="flex items-center justify-center my-8">
          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
          <div className="mx-3 text-lg text-indigo-400 dark:text-indigo-500">✦</div>
          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
        </div>

        {/* Componente para exibir o valor total do prêmio */}
        {(closestGuess?.guess || nextGuesses.length > 0) && (
          <div className="relative mx-auto max-w-xs">
            <Popover>
              <PopoverTrigger asChild>
                <div className="bg-gradient-to-br from-amber-400/90 via-yellow-500/90 to-amber-600/90 dark:from-amber-500/80 dark:via-yellow-600/80 dark:to-amber-700/80 rounded-2xl px-6 py-5 shadow-xl border border-amber-300 dark:border-amber-700/50 transform hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-sm hover:shadow-amber-300/30 dark:hover:shadow-amber-700/30">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide">Prêmio Total</span>
                      <InfoIcon className="h-4 w-4 text-amber-700 dark:text-amber-300 animate-pulse" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <span className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-white">
                        R$ {(totalGuessCount * (appSettings?.guessPrice || 10)).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="ml-1 text-xs font-medium text-amber-800 dark:text-amber-200">,00</span>
                    </div>
                    <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-2 bg-amber-200/30 dark:bg-amber-800/30 px-3 py-1 rounded-full">
                      {totalGuessCount} palpites x R$ {(appSettings?.guessPrice || 10).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  
                  {/* Efeito de brilho/destaque */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-300 dark:from-yellow-600 dark:to-amber-500 rounded-lg blur-sm opacity-50 animate-pulse"></div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white dark:bg-slate-900 p-4 shadow-xl border border-amber-200 dark:border-amber-800/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium text-amber-800 dark:text-amber-400">Regras do Prêmio</h3>
                  </div>
                  <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se alguém acertar <strong>sozinho</strong> a data exata do nascimento, leva <strong>todo o prêmio</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se <strong>várias pessoas</strong> acertarem a mesma data, o prêmio será <strong>dividido igualmente</strong> entre elas.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 dark:text-amber-500 font-bold">•</span>
                      <span>Se <strong>ninguém acertar</strong> a data exata, o prêmio será guardado para a <strong>bebê</strong>.</span>
                    </li>
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">Clique fora para fechar</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6">
        {babyBorn ? (
        // Exibição quando o bebê já nasceu
        <div className="w-full max-w-5xl mx-auto space-y-8">
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
        <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-10">
          {/* Novo formato para contadores principais sempre visíveis */}
          <div className="relative z-10">
            {/* Painel de contadores fixo */}
            <div className="sticky top-20 transform transition-all duration-300 mb-14">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-4xl mx-auto">
                {/* Efeito decorativo de brilho para destacar a área dos cards */}
                <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/5 via-purple-500/10 to-indigo-500/5 rounded-[50%] blur-3xl -z-10 opacity-90"></div>
              
                {/* Countdown para data esperada */}
                {expectedBirthCountdown && (
                  <div className="transform hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-indigo-200/50 dark:border-indigo-800/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                      {/* Cabeçalho colorido */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-4 text-center">
                        <h3 className="font-bold text-white text-lg">Data Provável de Nascimento</h3>
                        <p className="text-xs text-white/80 mt-1">
                          {appSettings?.expectedBirthDate ? 
                            new Date(appSettings.expectedBirthDate.seconds * 1000).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }) : 'Não definida'}
                        </p>
                      </div>
                      
                      {/* Contadores */}
                      <div className="p-5">
                        <div className="grid grid-cols-5 gap-3 text-center">
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{expectedBirthCountdown.weeks}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sem</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{expectedBirthCountdown.days}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dias</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{expectedBirthCountdown.hours}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hrs</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{expectedBirthCountdown.minutes}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Min</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{expectedBirthCountdown.seconds}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seg</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Progresso</span>
                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">{Math.round(expectedBirthCountdown.progress)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${expectedBirthCountdown.progress || 0}%` }}></div>
                          </div>
                        </div>
                        
                        {/* Informação adicional - Total de dias */}
                        <div className="mt-3 bg-indigo-50/50 dark:bg-indigo-900/20 text-center rounded-md py-1.5 px-3 text-xs font-medium border border-indigo-100 dark:border-indigo-800/30">
                          <span className="text-indigo-700 dark:text-indigo-300 font-semibold">Total:</span> {Math.floor((expectedBirthCountdown.weeks || 0) * 7 + (expectedBirthCountdown.days || 0))} dias
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Idade Gestacional (baseada na DUM) */}
                {gestationalAge && appSettings?.lastMenstruationDate && (
                  <div className="transform hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-200/50 dark:border-blue-800/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                      {/* Cabeçalho colorido */}
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 py-3 px-4 text-center">
                        <h3 className="font-bold text-white text-lg">Idade Gestacional</h3>
                        <p className="text-xs text-white/80 mt-1">
                          DUM (Data da Última Menstruação): {new Date(appSettings.lastMenstruationDate.seconds * 1000).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long'
                          })}
                        </p>
                      </div>
                      
                      {/* Contadores */}
                      <div className="p-5">
                        <div className="grid grid-cols-5 gap-3 text-center">
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gestationalAge.weeks}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sem</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gestationalAge.days}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dias</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gestationalAge.hours}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hrs</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gestationalAge.minutes}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Min</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">{gestationalAge.seconds}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seg</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Progresso</span>
                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">{Math.round(gestationalAge.progress || 0)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${gestationalAge.progress || 0}%` }}></div>
                          </div>
                        </div>
                        
                        {/* Informação adicional */}
                        <div className="mt-3 bg-blue-50/50 dark:bg-blue-900/20 text-center rounded-md py-1.5 px-3 text-xs font-medium border border-blue-100 dark:border-blue-800/30">
                          <span className="text-blue-700 dark:text-blue-300 font-semibold">Total:</span> {gestationalAge.totalDays} dias
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
          </div>
          
          {/* Palpite mais próximo em destaque - card maior e mais destacado */}
          {closestGuess?.guess && (
            <div className="mt-14 mb-8 relative">
              <h2 className="text-center text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 mb-6">
                Palpite Mais Próximo
                <div className="mt-2 mx-auto w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
              </h2>
              
              {/* Efeito decorativo para dar mais destaque */}
              <div className="absolute -inset-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-[30%] blur-3xl -z-10"></div>
              <div className="transform hover:-translate-y-1 transition-all duration-300">
                <div className="max-w-4xl mx-auto relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-700 dark:to-orange-600 rounded-xl blur-md opacity-60 animate-pulse"></div>
                  <div className="relative">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-amber-200/50 dark:border-amber-800/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                      {/* Cabeçalho colorido */}
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-3 px-4">
                        <div className="flex flex-col">
                          <h3 className="font-bold text-white text-lg truncate">
                            {closestGuess.guess.userName} <span className="ml-1 text-xs font-medium px-2 py-0.5 bg-white/20 rounded-full">Mais próximo</span>
                          </h3>
                          <p className="text-xs text-white/80 mt-1">
                            Palpite: {new Date(closestGuess.guess.guessDate.seconds * 1000).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Contadores */}
                      <div className="p-5">
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{countdowns[closestGuess.guess.id] ? Math.floor(countdowns[closestGuess.guess.id].weeks * 7 + countdowns[closestGuess.guess.id].days) : 0}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dias</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{countdowns[closestGuess.guess.id]?.hours || 0}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hrs</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{countdowns[closestGuess.guess.id]?.minutes || 0}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Min</div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/80 shadow rounded-lg p-2 relative">
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 animate-pulse">{countdowns[closestGuess.guess.id]?.seconds || 0}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seg</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Progresso</span>
                            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">{Math.round(countdowns[closestGuess.guess.id]?.progress || 0)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${countdowns[closestGuess.guess.id]?.progress || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Próximos palpites */}
          {nextGuesses.length > 0 && (
            <div className="space-y-6 mt-16 relative">
              <h2 className="text-center text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 mb-6">
                Próximos Palpites
                <div className="mt-2 mx-auto w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              </h2>
              
              {/* Efeito decorativo para esta seção */}
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-[40%] blur-3xl -z-10"></div>
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
          <div className="mt-16 mb-10 relative">
            {/* Barra decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
            
            <div className="py-8 px-4 rounded-2xl bg-gradient-to-b from-slate-50/30 to-transparent dark:from-slate-900/30 dark:to-transparent backdrop-blur-sm mt-6">
              <h3 className="text-center font-medium text-slate-700 dark:text-slate-300 mb-6">Opções Disponíveis</h3>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/guesses" className="w-full sm:w-auto">
                  <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white cursor-pointer shadow-md w-full sm:w-auto" size="lg">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver todos os palpites
                  </Button>
                </Link>
                
                {user && (
                  <Link href="/my-guesses" className="w-full sm:w-auto">
                    <Button variant="outline" className="border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer shadow-sm w-full sm:w-auto" size="lg">
                      <UserRound className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Meus Palpites
                    </Button>
                  </Link>
                )}
                
                {allowGuesses && (
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 cursor-pointer shadow-md w-full sm:w-auto"
                    onClick={() => setGuessFormOpen(true)}
                    size="lg"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Adicionar Palpite
                  </Button>
                )}
              </div>
            </div>
            
            {/* Barra decorativa inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Modal de palpite */}
      <GuessForm
        open={guessFormOpen}
        onOpenChange={setGuessFormOpen}
        onSuccess={refreshData}
      />
      </div>
    </main>
  );
}
