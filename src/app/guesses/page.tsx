'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllGuesses, getAppSettings } from '@/lib/firebase/firestore';
import { BirthGuess, AppSettings } from '@/types';
import { Progress } from "@/components/ui/progress";
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
import { ArrowLeftIcon, CalendarIcon, ClockIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

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
      <div className="flex flex-col space-y-1">
        <div className="grid grid-cols-5 gap-1 text-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold">{countdown.weeks}</span>
            <span className="text-[10px] text-muted-foreground">Sem</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{countdown.days}</span>
            <span className="text-[10px] text-muted-foreground">Dias</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{countdown.hours}</span>
            <span className="text-[10px] text-muted-foreground">Hrs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{countdown.minutes}</span>
            <span className="text-[10px] text-muted-foreground">Min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">{countdown.seconds}</span>
            <span className="text-[10px] text-muted-foreground">Seg</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{Math.round(countdown.progress)}%</span>
          </div>
          <Progress value={countdown.progress} className="h-1.5" />
        </div>
      </div>
    );
  };
  
  // Verificar se o bebê já nasceu
  const babyBorn = appSettings?.actualBirthDate !== null && appSettings?.actualBirthDate !== undefined;
  
  // Função para determinar a cor do badge baseado na diferença
  const getDifferenceBadgeColor = (diff: number): "default" | "secondary" | "destructive" | "outline" => {
    if (diff <= 1) return "secondary";
    if (diff <= 3) return "outline";
    if (diff <= 7) return "default";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-1">
            Todos os Palpites
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Palpites para o nascimento {appSettings?.babyName ? `da ${appSettings.babyName}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'cards' | 'table')} className="mr-2">
            <TabsList className="grid grid-cols-2 w-[180px]">
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex gap-2 text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleSort('name')}
            className="text-xs md:text-sm h-8"
          >
            Ordenar por Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleSort('date')}
            className="text-xs md:text-sm h-8"
          >
            Ordenar por Data {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      <Tabs value={activeView} className="w-full">
        <TabsContent value="cards" className="mt-2">
          {guesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {sortedGuesses.map((guess) => {
                const guessDate = new Date(guess.guessDate.seconds * 1000);
                let difference = null;
                
                if (babyBorn && appSettings?.actualBirthDate) {
                  const birthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
                  const diff = calculateDifference(guessDate, birthDate);
                  difference = diff;
                }
                
                return (
                  <Card key={guess.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="py-3 px-4 bg-card/80">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold truncate">
                          {guess.userName}
                        </CardTitle>
                        {babyBorn && difference && (
                          <Badge variant={getDifferenceBadgeColor(difference.days)}>
                            {difference.days}d {difference.hours}h
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {guessDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                        <span className="mx-1">•</span>
                        <ClockIcon className="mr-1 h-3 w-3" />
                        {guessDate.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      {!babyBorn && renderCountdown(guess)}
                      
                      {guess.comment && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-start">
                            <ChatBubbleIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <p className="text-sm line-clamp-2">{guess.comment}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum palpite registrado ainda.</p>
              <p className="mt-2">Seja o primeiro a registrar um palpite!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table" className="mt-2">
          <Card>
            <CardContent className="p-0">
              {guesses.length > 0 ? (
                <Table>
                  <TableCaption>
                    {guesses.length} {guesses.length === 1 ? 'palpite registrado' : 'palpites registrados'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                        Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                        Data Palpitada {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Comentário</TableHead>
                      {babyBorn && (
                        <TableHead>Diferença</TableHead>
                      )}
                      {!babyBorn && (
                        <TableHead>Contagem Regressiva</TableHead>
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
                        <TableRow key={guess.id}>
                          <TableCell className="font-medium">{guess.userName}</TableCell>
                          <TableCell>
                            {guessDate.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>{guess.comment || '-'}</TableCell>
                          {babyBorn ? (
                            <TableCell>
                              {difference && (
                                <Badge variant={getDifferenceBadgeColor(difference.days)}>
                                  {difference.days}d {difference.hours}h
                                </Badge>
                              )}
                            </TableCell>
                          ) : (
                            <TableCell>
                              {countdowns[guess.id] && (
                                <span className="whitespace-nowrap text-xs">
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
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum palpite registrado ainda.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
