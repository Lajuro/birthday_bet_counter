'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllGuesses, getAppSettings } from '@/lib/firebase/firestore';
import { BirthGuess, AppSettings } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, CalendarIcon, ChatBubbleIcon, PlusIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { GuessForm } from '@/components/bets/guess-form';

// Interface para os countdowns calculados
interface CountdownData {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export default function GuessesPage() {
  const [guesses, setGuesses] = useState<BirthGuess[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'date' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [countdowns, setCountdowns] = useState<{[key: string]: CountdownData}>({});
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards');
  const [guessFormOpen, setGuessFormOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedGuesses, settings] = await Promise.all([
          getAllGuesses(),
          getAppSettings()
        ]);
        
        setGuesses(fetchedGuesses);
        setAppSettings(settings);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados', {
          description: 'Não foi possível carregar os palpites. Tente novamente mais tarde.'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calcular countdown para cada palpite
  useEffect(() => {
    if (!guesses.length) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns: {[key: string]: CountdownData} = {};
      
      guesses.forEach(guess => {
        if (guess.guessDate && guess.guessDate.seconds) {
          const guessDate = new Date(guess.guessDate.seconds * 1000);
          const difference = guessDate.getTime() - now.getTime();
          
          if (difference <= 0) {
            newCountdowns[guess.id] = { weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 };
          } else {
            // Calcular progresso
            const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
            const startDate = new Date(guessDate.getTime() - totalWaitDuration);
            const totalDuration = guessDate.getTime() - startDate.getTime();
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
        }
      });
      
      setCountdowns(newCountdowns);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [guesses]);

  // Calcular diferenças de dias entre a data de nascimento e os palpites
  const calculateDifference = (guessDate: Date, birthDate: Date) => {
    const diffTime = Math.abs(birthDate.getTime() - guessDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days: diffDays, hours: diffHours };
  };

  const sortedGuesses = [...guesses].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.guessDate.seconds * 1000);
      const dateB = new Date(b.guessDate.seconds * 1000);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    } else {
      return sortDirection === 'asc'
        ? a.userName.localeCompare(b.userName)
        : b.userName.localeCompare(a.userName);
    }
  });

  const toggleSort = (field: 'date' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderCountdown = (guess: BirthGuess) => {
    const countdown = countdowns[guess.id];
    if (!countdown) return null;
    
    return (
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{countdown.weeks}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Sem</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{countdown.days}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Dias</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{countdown.hours}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Hrs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{countdown.minutes}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{countdown.seconds}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Seg</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-700 dark:text-slate-300">Progresso</span>
            <span className="text-indigo-600 dark:text-indigo-400">{Math.round(countdown.progress)}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${countdown.progress}%` }} 
            />
          </div>
        </div>
      </div>
    );
  };

  // Verificar se o bebê já nasceu
  const babyBorn = appSettings?.actualBirthDate !== null && appSettings?.actualBirthDate !== undefined;

  const refreshGuesses = async () => {
    try {
      const fetchedGuesses = await getAllGuesses();
      setGuesses(fetchedGuesses);
    } catch (error) {
      console.error('Erro ao atualizar palpites:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {babyBorn ? 'Resultado dos Palpites' : 'Palpites do Nascimento'}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => setGuessFormOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Palpite
            </Button>
            
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'cards' | 'table')} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="cards">Cartões</TabsTrigger>
                <TabsTrigger value="table">Tabela</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-3 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('name')}
              className="text-xs md:text-sm h-9 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
            >
              Ordenar por Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSort('date')}
              className="text-xs md:text-sm h-9 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
            >
              Ordenar por Data {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>

        <Tabs value={activeView} className="w-full">
          <TabsContent value="cards" className="mt-2">
            {guesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {sortedGuesses.map((guess) => {
                  const guessDate = new Date(guess.guessDate.seconds * 1000);
                  let difference = null;
                  
                  if (babyBorn && appSettings?.actualBirthDate) {
                    const birthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
                    const diff = calculateDifference(guessDate, birthDate);
                    difference = diff;
                  }
                  
                  return (
                    <Card key={guess.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 duration-300 bg-white dark:bg-slate-900">
                      <CardHeader className="py-4 px-5 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20">
                        <div className="flex flex-col items-center justify-center">
                          <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400 text-center">
                            {guess.userName}
                          </CardTitle>
                          <div className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                            {guessDate.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </div>
                          {babyBorn && difference && (
                            <Badge className="mt-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs px-2.5 py-1 font-medium">
                              {difference.days}d {difference.hours}h
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 px-5">
                        {!babyBorn && renderCountdown(guess)}
                        
                        {guess.comment && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-start">
                              <ChatBubbleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                              <p className="text-sm text-slate-700 dark:text-slate-300">{guess.comment}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                <p className="text-xl font-medium text-indigo-700 dark:text-indigo-400">Nenhum palpite registrado ainda.</p>
                <p className="mt-3 text-slate-600 dark:text-slate-400">Seja o primeiro a registrar um palpite!</p>
                <div className="mt-6">
                  <Link href="/admin">
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      Fazer meu palpite
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="table" className="mt-2">
            <Card className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                {guesses.length > 0 ? (
                  <Table>
                    <TableCaption className="text-slate-600 dark:text-slate-400 py-4">
                      {guesses.length} {guesses.length === 1 ? 'palpite registrado' : 'palpites registrados'}
                    </TableCaption>
                    <TableHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20">
                      <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                        <TableHead className="text-indigo-700 dark:text-indigo-400 font-medium cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors h-12" onClick={() => toggleSort('name')}>
                          Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="text-indigo-700 dark:text-indigo-400 font-medium cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors" onClick={() => toggleSort('date')}>
                          Data Palpitada {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="text-indigo-700 dark:text-indigo-400 font-medium">Comentário</TableHead>
                        {babyBorn && (
                          <TableHead className="text-indigo-700 dark:text-indigo-400 font-medium">Diferença</TableHead>
                        )}
                        {!babyBorn && (
                          <TableHead className="text-indigo-700 dark:text-indigo-400 font-medium">Contagem Regressiva</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedGuesses.map((guess) => {
                        const guessDate = new Date(guess.guessDate.seconds * 1000);
                        let difference = null;
                        
                        if (babyBorn && appSettings?.actualBirthDate) {
                          const birthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
                          const diff = calculateDifference(guessDate, birthDate);
                          difference = diff;
                        }
                        
                        return (
                          <TableRow key={guess.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <TableCell className="font-medium text-slate-800 dark:text-slate-200">{guess.userName}</TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {guessDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{guess.comment || '-'}</TableCell>
                            {babyBorn ? (
                              <TableCell>
                                {difference && (
                                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-xs px-2.5 py-1 font-medium">
                                    {difference.days}d {difference.hours}h
                                  </Badge>
                                )}
                              </TableCell>
                            ) : (
                              <TableCell>
                                {countdowns[guess.id] && (
                                  <span className="whitespace-nowrap text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                    {countdowns[guess.id].weeks}w {countdowns[guess.id].days}d {countdowns[guess.id].hours}h {countdowns[guess.id].minutes}m
                                  </span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                    Nenhum palpite registrado ainda.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <GuessForm
        open={guessFormOpen}
        onOpenChange={setGuessFormOpen}
        onSuccess={refreshGuesses}
      />
    </div>
  );
}
