'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllGuesses, getAppSettings } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { BirthGuess, AppSettings } from '@/types';
import { ArrowLeft, Calendar, Trophy, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { debug } from '@/lib/debug';

export default function MyGuessesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [myGuesses, setMyGuesses] = useState<BirthGuess[]>([]);
  const [allGuesses, setAllGuesses] = useState<BirthGuess[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do Firestore
  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      
      if (!user) {
        toast.error("Você precisa estar logado para ver seus palpites");
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Carregar configurações do app
        const settings = await getAppSettings();
        setAppSettings(settings);
        
        // Carregar todos os palpites
        const guesses = await getAllGuesses();
        setAllGuesses(guesses || []);
        
        // Filtrar apenas os palpites do usuário logado
        const userGuesses = guesses?.filter(guess => guess.userId === user.uid) || [];
        
        // Ordenar os palpites por data (do mais próximo para o mais distante)
        const sortedGuesses = userGuesses.sort((a, b) => {
          if (!a.guessDate || !b.guessDate) return 0;
          return a.guessDate.seconds - b.guessDate.seconds;
        });
        
        setMyGuesses(sortedGuesses);
      } catch (error) {
        debug.error('app', 'Erro ao carregar dados:', error);
        toast.error("Não foi possível carregar seus palpites");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user, authLoading]);

  // Calcular quanto o usuário ganharia se acertasse um palpite específico
  const calculatePotentialPrize = (guessDate: Date) => {
    if (!appSettings || !allGuesses.length) return 0;
    
    // Obter o valor do palpite das configurações
    const guessPrice = appSettings.guessPrice || 10;
    
    // Calcular o prêmio total (todos os palpites)
    const totalPrize = allGuesses.length * guessPrice;
    
    // Encontrar quantos palpites existem para a mesma data
    const sameGuesses = allGuesses.filter(g => {
      if (!g.guessDate || !g.guessDate.seconds) return false;
      const gDate = new Date(g.guessDate.seconds * 1000);
      return gDate.toDateString() === guessDate.toDateString();
    });
    
    // Se só o usuário apostou nesta data, ganha o prêmio todo
    // Caso contrário, divide entre todos que apostaram na mesma data
    return totalPrize / sameGuesses.length;
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Se o usuário não estiver logado, mostrar mensagem
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-indigo-600 dark:text-indigo-400">Acesso Restrito</CardTitle>
            <CardDescription className="text-center">Você precisa estar logado para ver seus palpites</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Faça login para acessar a página de seus palpites.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Página Inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <header className="mb-8">
          <div className="flex items-center mb-2">
            <Link href="/">
              <Button variant="ghost" className="mr-2 p-0 h-8 w-8">
                <ArrowLeft className="h-5 w-5 text-indigo-500" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              Meus Palpites
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Acompanhe todos os seus palpites ordenados cronologicamente
          </p>
        </header>

        {isLoading ? (
          // Esqueleto de carregamento
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full bg-white dark:bg-slate-900 shadow-md">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex justify-between mt-3 pt-3 border-t">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : myGuesses.length === 0 ? (
          // Mensagem para nenhum palpite
          <Card className="w-full bg-white dark:bg-slate-900 shadow-md">
            <CardHeader>
              <CardTitle className="text-center text-amber-600 dark:text-amber-500">Nenhum Palpite Encontrado</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                Você ainda não fez nenhum palpite para o nascimento da {appSettings?.babyName || 'bebê'}.
              </p>
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700 mt-2">
                  Adicionar Palpite
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Lista de palpites do usuário
          <div className="space-y-4">
            {myGuesses.map((guess) => {
              // Converter o timestamp para Date
              const guessDate = guess.guessDate && guess.guessDate.seconds
                ? new Date(guess.guessDate.seconds * 1000)
                : null;
                
              if (!guessDate) return null;
              
              // Calcular o prêmio potencial
              const potentialPrize = calculatePotentialPrize(guessDate);
              
              // Encontrar outros palpites na mesma data
              const sameGuesses = allGuesses.filter(g => {
                if (!g.guessDate || !g.guessDate.seconds) return false;
                const gDate = new Date(g.guessDate.seconds * 1000);
                return gDate.toDateString() === guessDate.toDateString() && g.id !== guess.id;
              });
              
              return (
                <Card 
                  key={guess.id} 
                  className="w-full bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-indigo-600 dark:text-indigo-400">
                      Palpite para {formatDate(guessDate)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-amber-600 dark:text-amber-500 gap-2">
                        <Trophy className="h-5 w-5" />
                        <p className="font-medium">
                          Prêmio potencial: <span className="font-bold">
                            R$ {potentialPrize.toFixed(2).replace('.', ',')}
                          </span>
                        </p>
                      </div>
                      
                      {sameGuesses.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {sameGuesses.length} {sameGuesses.length === 1 ? 'pessoa também apostou' : 'pessoas também apostaram'} nesta data
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Se o bebê nascer nesta data, o prêmio será dividido entre {sameGuesses.length + 1} pessoas.
                          </p>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Registrado como:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {guess.userName}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <div className="py-4 text-center">
              <Link href="/">
                <Button variant="outline" className="mr-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
