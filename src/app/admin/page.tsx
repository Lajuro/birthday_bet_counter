'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { 
  getAllGuesses, 
  getAppSettings, 
  updateAppSettings, 
  deleteGuess,
  deleteManyGuesses,
  getAllUsers,
  updateUserProfile,
  determineWinner,
  WinnerResult,
  getPendingUsers,
  approveUser,
  rejectUser,
  createBulkGuess,
  serverTimestamp
} from '@/lib/firebase/firestore';
import { BirthGuess, AppSettings, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, PlusCircle, Check as CheckIcon, X, Loader2, Edit, Trash2, CheckCircle, XCircle, ListPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminPage() {
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();
  const [guesses, setGuesses] = useState<BirthGuess[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [updatingDate, setUpdatingDate] = useState(false);
  const [actualBirthDate, setActualBirthDate] = useState<Date | undefined>(undefined);
  // Estado removido pois não está sendo utilizado
  // const [isGuessDialogOpen, setIsGuessDialogOpen] = useState(false);
  // const [selectedGuess, setSelectedGuess] = useState<BirthGuess | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [deletingGuess, setDeletingGuess] = useState<string | null>(null);
  const [winnerResult, setWinnerResult] = useState<WinnerResult | null>(null);
  const [addingBulkGuesses, setAddingBulkGuesses] = useState(false);
  const [currentGuessInfo, setCurrentGuessInfo] = useState<{index: number, total: number, name: string} | null>(null);
  const [showWinnerResult, setShowWinnerResult] = useState(false);
  const [selectedGuesses, setSelectedGuesses] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!isLoading && (!user || (userProfile && !userProfile.isAdmin))) {
        toast.error("Acesso não autorizado", {
          description: "Você precisa ser um administrador para acessar esta página."
        });
        router.push('/');
        return;
      }

      if (!isLoading && user) {
        try {
          // Carregar todos os palpites, configurações e usuários
          const [allGuesses, appSettings, allUsers, allPendingUsers] = await Promise.all([
            getAllGuesses(),
            getAppSettings(),
            getAllUsers(),
            getPendingUsers()
          ]);
          
          setGuesses(allGuesses);
          setSettings(appSettings);
          setUsers(allUsers);
          setPendingUsers(allPendingUsers);
          
          if (appSettings?.actualBirthDate) {
            setActualBirthDate(new Date(appSettings.actualBirthDate.seconds * 1000));
            
            // Se já temos a data real, podemos calcular o vencedor
            const winner = await determineWinner();
            setWinnerResult(winner);
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          toast.error("Erro ao carregar dados", {
            description: "Não foi possível carregar as informações. Tente novamente mais tarde."
          });
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [user, userProfile, isLoading, router]);

  const handleSetActualBirthDate = async () => {
    if (!actualBirthDate || !settings) return;

    setUpdatingDate(true);
    setShowWinnerResult(false);
    
    try {
      const timestamp = Timestamp.fromDate(actualBirthDate);
      await updateAppSettings({
        ...settings,
        actualBirthDate: timestamp
      });
      
      toast.success('Data de nascimento atualizada com sucesso!');
      setSettings({
        ...settings,
        actualBirthDate: timestamp
      });
      
      // Calcular o vencedor após definir a data real
      const winner = await determineWinner();
      setWinnerResult(winner);
      setShowWinnerResult(true);
    } catch (error) {
      console.error('Erro ao atualizar data de nascimento:', error);
      toast.error('Erro ao atualizar data de nascimento.');
    } finally {
      setUpdatingDate(false);
    }
  };

  const handleDeleteGuess = async (guessId: string) => {
    setDeletingGuess(guessId);
    try {
      await deleteGuess(guessId);
      toast.success("Palpite excluído com sucesso");
      
      // Atualizar a lista de palpites
      const updatedGuesses = guesses.filter(g => g.id !== guessId);
      setGuesses(updatedGuesses);
    } catch (error) {
      console.error("Erro ao excluir palpite:", error);
      toast.error("Erro ao excluir palpite", {
        description: "Não foi possível excluir o palpite. Tente novamente mais tarde."
      });
    } finally {
      setDeletingGuess(null);
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    setUpdatingUser(userId);
    try {
      const userToUpdate = users.find(u => u.uid === userId);
      if (!userToUpdate) return;

      // Atualizar o status de admin do usuário
      await updateUserProfile(userId, {
        ...userToUpdate,
        isAdmin: !isCurrentlyAdmin
      });

      toast.success(
        `Usuário ${!isCurrentlyAdmin ? 'promovido a administrador' : 'removido da administração'}`
      );
      
      // Atualizar a lista de usuários
      const updatedUsers = users.map(u => 
        u.uid === userId ? { ...u, isAdmin: !isCurrentlyAdmin } : u
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário", {
        description: "Não foi possível atualizar as permissões do usuário. Tente novamente mais tarde."
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  // Função removida pois não está sendo utilizada
  // const handleGuessFormSuccess = async () => {
  //   // Recarregar a lista de palpites
  //   try {
  //     const updatedGuesses = await getAllGuesses();
  //     setGuesses(updatedGuesses);
  //   } catch (error) {
  //     console.error("Erro ao recarregar palpites:", error);
  //   }
    
  //   // Fechar o modal
  //   setIsGuessDialogOpen(false);
  //   setSelectedGuess(null);
  // };

  // Função para aprovar um usuário
  const handleApproveUser = async (userId: string) => {
    if (!user) return;
    
    setProcessingAction(userId);
    
    try {
      const success = await approveUser(userId, user.uid);
      
      if (success) {
        toast.success('Usuário aprovado com sucesso!');
        
        // Atualizar a lista de usuários pendentes
        const updatedPendingUsers = await getPendingUsers();
        setPendingUsers(updatedPendingUsers);
        
        // Atualizar a lista completa de usuários
        const updatedAllUsers = await getAllUsers();
        setUsers(updatedAllUsers);
      } else {
        toast.error('Erro ao aprovar usuário.');
      }
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro ao aprovar usuário.');
    } finally {
      setProcessingAction(null);
    }
  };
  
  // Função para rejeitar um usuário
  const handleRejectUser = async (userId: string) => {
    setProcessingAction(userId);
    
    try {
      const success = await rejectUser(userId);
      
      if (success) {
        toast.success('Usuário rejeitado com sucesso!');
        
        // Atualizar a lista de usuários pendentes
        const updatedPendingUsers = await getPendingUsers();
        setPendingUsers(updatedPendingUsers);
        
        // Atualizar a lista completa de usuários
        const updatedAllUsers = await getAllUsers();
        setUsers(updatedAllUsers);
      } else {
        toast.error('Erro ao rejeitar usuário.');
      }
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro ao rejeitar usuário.');
    } finally {
      setProcessingAction(null);
    }
  };

  // Função para buscar todos os palpites
  const fetchGuesses = async () => {
    try {
      const allGuesses = await getAllGuesses();
      setGuesses(allGuesses);
    } catch (error) {
      console.error("Erro ao buscar palpites:", error);
      toast.error("Não foi possível carregar os palpites");
    }
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, format: 'csv' | 'json') => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      setAddingBulkGuesses(false);
      return;
    }

    const file = event.target.files[0];
    setAddingBulkGuesses(true);
    setCurrentGuessInfo({ index: 0, total: 1, name: "Analisando arquivo..." });
    
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target?.result) {
        toast.error("Erro ao ler o arquivo");
        setAddingBulkGuesses(false);
        return;
      }

      try {
        let guessesToAdd: {name: string; date: string; relation?: string; weight?: string; height?: string; comment?: string}[] = [];
        
        if (format === 'csv') {
          // Processar CSV
          const content = e.target.result as string;
          console.log("Conteúdo CSV recebido:", content.substring(0, 200) + "...");
          const lines = content.split('\n');
          
          if (lines.length > 1) {
            // Pegar o cabeçalho e remover espaços em branco e aspas
            const headers = lines[0].split(',').map(h => 
              h.trim().replace(/^"(.*)"$/, '$1').toLowerCase() // Remover aspas e converter para minúsculo
            );
            
            console.log("Headers identificados:", headers);
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              
              // Dividir a linha, respeitando aspas em campos com vírgulas
              const values: string[] = [];
              let inQuote = false;
              let currentValue = '';
              
              for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                
                if (char === '"') {
                  inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                  values.push(currentValue.replace(/^"(.*)"$/, '$1').trim());
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              
              // Adicionar o último valor
              values.push(currentValue.replace(/^"(.*)"$/, '$1').trim());
              
              // Criar objeto usando os cabeçalhos como chaves
              const guessObj: {
                name: string;
                date: string;
                relation?: string;
                weight?: string;
                height?: string;
                comment?: string;
              } = {
                name: '',
                date: ''
              };
              
              headers.forEach((header, index) => {
                if (index < values.length) {
                  // Mapear cabeçalhos para propriedades corretas
                  if (header === 'nome') guessObj.name = values[index];
                  else if (header === 'data') guessObj.date = values[index];
                  else if (header === 'relação' || header === 'relacao') guessObj.relation = values[index];
                  else if (header === 'peso (kg)' || header === 'peso') guessObj.weight = values[index];
                  else if (header === 'altura (cm)' || header === 'altura') guessObj.height = values[index];
                  else if (header === 'comentário' || header === 'comentario') guessObj.comment = values[index];
                }
              });
              
              if (guessObj.name && guessObj.date) {
                guessesToAdd.push(guessObj);
                console.log(`Palpite CSV processado: ${guessObj.name}, ${guessObj.date}`);
              }
            }
          }
        } else if (format === 'json') {
          // Processar JSON
          try {
            const content = e.target.result as string;
            console.log("Conteúdo JSON recebido:", content.substring(0, 200) + "...");
            const jsonData = JSON.parse(content);
            
            if (Array.isArray(jsonData)) {
              console.log(`Dados JSON contêm um array com ${jsonData.length} itens`);
              guessesToAdd = jsonData.map(item => {
                const processedItem = {
                  name: item.userName || item.name || '',
                  date: item.date || '',
                  relation: item.relation || undefined,
                  weight: item.weight !== undefined ? String(item.weight) : undefined,
                  height: item.height !== undefined ? String(item.height) : undefined,
                  comment: item.comment || undefined
                };
                console.log(`Processando item JSON: ${processedItem.name}, ${processedItem.date}`);
                return processedItem;
              }).filter(item => item.name && item.date);
            } else if (typeof jsonData === 'object' && jsonData !== null) {
              console.log("Dados JSON contêm um único objeto");
              const singleItem = {
                name: jsonData.userName || jsonData.name || '',
                date: jsonData.date || '',
                relation: jsonData.relation || undefined,
                weight: jsonData.weight !== undefined ? String(jsonData.weight) : undefined,
                height: jsonData.height !== undefined ? String(jsonData.height) : undefined,
                comment: jsonData.comment || undefined
              };
              
              if (singleItem.name && singleItem.date) {
                guessesToAdd = [singleItem];
                console.log(`Processando único item JSON: ${singleItem.name}, ${singleItem.date}`);
              }
            }
          } catch (jsonError) {
            console.error("Erro ao processar JSON:", jsonError);
            toast.error("Formato de JSON inválido");
            setAddingBulkGuesses(false);
            return;
          }
        }
        
        console.log(`Total de palpites a adicionar: ${guessesToAdd.length}`);
        
        if (guessesToAdd.length === 0) {
          toast.error("Nenhum palpite válido encontrado no arquivo");
          setAddingBulkGuesses(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Processar cada palpite da lista
        for (let i = 0; i < guessesToAdd.length; i++) {
          const guess = guessesToAdd[i];
          
          // Atualizar informação de progresso
          setCurrentGuessInfo({
            index: i,
            total: guessesToAdd.length,
            name: guess.name
          });
          
          // Extrair data e hora do formato DD/MM ou DD/MM/YYYY
          let guessDate = new Date();
          const parts = guess.date.split('/');
          
          if (parts.length >= 2) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Meses em JS são 0-indexed
            const year = parts.length > 2 ? parseInt(parts[2]) : new Date().getFullYear();
            
            guessDate = new Date(year, month, day);
          }
          
          // Criar o palpite com tipagem explícita
          const newGuess: {
            userName: string;
            guessDate: Timestamp;
            userId: string;
            createdAt: ReturnType<typeof serverTimestamp>;
            weight?: number;
            height?: number;
            comment?: string;
          } = {
            userName: guess.name + (guess.relation ? ` (${guess.relation})` : ''),
            guessDate: Timestamp.fromDate(guessDate),
            userId: user.uid,
            createdAt: serverTimestamp()
          };
          
          // Adicionar campos opcionais apenas se tiverem valores válidos
          if (guess.weight && !isNaN(parseFloat(guess.weight))) {
            newGuess.weight = parseFloat(guess.weight);
          }
          
          if (guess.height && !isNaN(parseFloat(guess.height))) {
            newGuess.height = parseFloat(guess.height);
          }
          
          if (guess.comment) {
            newGuess.comment = guess.comment;
          }
          
          console.log(`Enviando para Firestore:`, newGuess);
          
          // Adicionar o palpite ao Firestore
          try {
            await createBulkGuess(newGuess);
            console.log(`Palpite adicionado com sucesso: ${guess.name}`);
            successCount++;
          } catch (error) {
            console.error(`Erro ao criar palpite para ${guess.name}:`, error);
            errorCount++;
          }
          
          // Pequena pausa entre operações para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Recarregar os palpites após adicionar todos
        await fetchGuesses();
        
        if (successCount > 0) {
          toast.success(`${successCount} palpites importados com sucesso!`);
        }
        
        if (errorCount > 0) {
          toast.error(`${errorCount} palpites não puderam ser importados.`);
        }
      } catch (error) {
        console.error("Erro ao importar palpites:", error);
        toast.error("Erro ao importar palpites do arquivo");
      } finally {
        setAddingBulkGuesses(false);
        setCurrentGuessInfo(null);
        // Limpar o input file
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      console.error("Erro ao ler o arquivo");
      toast.error("Erro ao ler o arquivo");
      setAddingBulkGuesses(false);
    };
    
    reader.readAsText(file);
  };

  const toggleSelectAll = () => {
    if (selectedGuesses.length === guesses.length) {
      // Se todos já estão selecionados, desseleciona todos
      setSelectedGuesses([]);
    } else {
      // Caso contrário, seleciona todos
      setSelectedGuesses(guesses.map(g => g.id));
    }
  };

  const handleCheckboxChange = (guessId: string, index: number, event?: React.MouseEvent) => {
    // Verificar se a tecla Shift está pressionada
    const shiftKey = event?.shiftKey || false;
    
    // Verificar o estado atual do checkbox (selecionado ou não)
    const isCurrentlySelected = selectedGuesses.includes(guessId);
    
    if (shiftKey && lastCheckedIndex !== null) {
      // Se shift está pressionado e há um último checkbox clicado
      const start = Math.min(index, lastCheckedIndex);
      const end = Math.max(index, lastCheckedIndex);
      const rangeGuessIds = guesses.slice(start, end + 1).map(g => g.id);
      
      if (isCurrentlySelected) {
        // Se estamos desmarcando, remove todos os IDs no intervalo da seleção
        setSelectedGuesses(prevSelected => 
          prevSelected.filter(id => !rangeGuessIds.includes(id))
        );
      } else {
        // Se estamos marcando, adiciona todos os IDs no intervalo à seleção (sem duplicar)
        setSelectedGuesses(prevSelected => 
          [...new Set([...prevSelected, ...rangeGuessIds])]
        );
      }
    } else {
      // Comportamento normal para clique sem shift
      if (isCurrentlySelected) {
        // Remove apenas o ID atual
        setSelectedGuesses(prevSelected => 
          prevSelected.filter(id => id !== guessId)
        );
      } else {
        // Adiciona apenas o ID atual
        setSelectedGuesses(prevSelected => [...prevSelected, guessId]);
      }
    }
    
    // Atualizar o último índice checado
    setLastCheckedIndex(index);
  };

  const exportGuessesToCSV = () => {
    if (guesses.length === 0) {
      toast.error("Não há palpites para exportar");
      return;
    }

    // Criar cabeçalho do CSV
    const headers = ['Nome', 'Data', 'Peso (kg)', 'Altura (cm)', 'Comentário'];
    let csvContent = headers.join(',') + '\n';
    
    // Adicionar dados
    guesses.forEach(guess => {
      const dateStr = guess.guessDate && guess.guessDate.seconds 
        ? format(new Date(guess.guessDate.seconds * 1000), "dd/MM/yyyy HH:mm", { locale: ptBR }) 
        : '';
      
      // Escapar vírgulas e aspas nos dados
      const row = [
        `"${guess.userName.replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${guess.weight || ''}"`,
        `"${guess.height || ''}"`,
        `"${(guess.comment || '').replace(/"/g, '""')}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Criar arquivo de download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const date = format(new Date(), "yyyy-MM-dd", { locale: ptBR });
    const filename = `palpites-aniversario-${settings?.babyName || 'bebe'}-${date}.csv`;
    
    // Criar link para download e simular clique
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportGuessesToJSON = () => {
    if (guesses.length === 0) {
      toast.error("Não há palpites para exportar");
      return;
    }
    
    // Mapear palpites para um formato mais amigável para exportação
    const exportData = guesses.map(guess => {
      return {
        userName: guess.userName,
        date: guess.guessDate && guess.guessDate.seconds ? 
          format(
            new Date(guess.guessDate.seconds * 1000),
            "dd/MM/yyyy HH:mm",
            { locale: ptBR }
          ) : null,
        weight: guess.weight || null,
        height: guess.height || null,
        comment: guess.comment || null
      };
    });
    
    // Criar arquivo de download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const date = format(new Date(), "yyyy-MM-dd", { locale: ptBR });
    const filename = `palpites-aniversario-${settings?.babyName || 'bebe'}-${date}.json`;
    
    // Criar link para download e simular clique
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      
      {!isLoading && (!user || (userProfile && !userProfile.isAdmin)) && (
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-destructive">Acesso não autorizado</h2>
          <p className="text-destructive">Você precisa ser um administrador para acessar esta página.</p>
        </div>
      )}
      
      {!isLoading && user && userProfile && userProfile.isAdmin && (
        <>
          <Tabs defaultValue="guesses" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="guesses">Palpites</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="pending-users">Aprovação de Usuários</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guesses">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Todos os Palpites</CardTitle>
                      <CardDescription>
                        {guesses.length} palpites registrados
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          // Implementação atual para abrir diálogo de novo palpite
                          // setIsGuessDialogOpen(true);
                        }}
                        disabled={loading}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Palpite
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setIsImportDialogOpen(true)}
                        disabled={addingBulkGuesses}
                      >
                        {addingBulkGuesses ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {currentGuessInfo ? (
                              <span>
                                Importando {currentGuessInfo.index + 1}/{currentGuessInfo.total}: {currentGuessInfo.name}
                              </span>
                            ) : (
                              "Iniciando..."
                            )}
                          </>
                        ) : (
                          <>
                            <ListPlus className="mr-2 h-4 w-4" />
                            Importar
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsExportDialogOpen(true)}
                      >
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                        disabled={isDeletingMultiple || selectedGuesses.length === 0}
                      >
                        {isDeletingMultiple ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Excluir Selecionados ({selectedGuesses.length})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Lista de palpites para o nascimento {settings?.babyName ? `da ${settings.babyName}` : ''}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={guesses.length > 0 && selectedGuesses.length === guesses.length}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Selecionar todos os palpites"
                          />
                        </TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data e Hora</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Altura (cm)</TableHead>
                        <TableHead>Comentário</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guesses.length > 0 ? (
                        guesses.map((guess, index) => (
                          <TableRow key={guess.id}>
                            <TableCell>
                              <Checkbox 
                                id={`checkbox-${guess.id}`}
                                checked={selectedGuesses.includes(guess.id)}
                                onCheckedChange={() => {}}
                                onClick={(event) => {
                                  // Passa o evento React para a função de tratamento
                                  handleCheckboxChange(guess.id, index, event as React.MouseEvent);
                                }}
                                className="h-5 w-5 border-2"
                                aria-label={`Selecionar palpite de ${guess.userName}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{guess.userName}</TableCell>
                            <TableCell>
                              {guess.guessDate && guess.guessDate.seconds ? 
                                format(
                                  new Date(guess.guessDate.seconds * 1000),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR }
                                ) : "-"
                              }
                            </TableCell>
                            <TableCell>{guess.weight || "-"}</TableCell>
                            <TableCell>{guess.height || "-"}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {guess.comment || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    // Implementação atual para abrir diálogo de edição de palpite
                                    // setSelectedGuess(guess);
                                    // setIsGuessDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Excluir</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o palpite
                                        de &quot;{guess.userName}&quot;.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteGuess(guess.id)}
                                        disabled={deletingGuess === guess.id}
                                      >
                                        {deletingGuess === guess.id ? (
                                          "Excluindo..."
                                        ) : (
                                          "Excluir"
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Nenhum palpite registrado ainda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <CardDescription>Administre os usuários do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Lista de usuários registrados na plataforma</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Data de Registro</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((userItem) => (
                          <TableRow key={userItem.uid}>
                            <TableCell className="font-medium">
                              {userItem.displayName || 'Usuário sem nome'}
                            </TableCell>
                            <TableCell>{userItem.email || '-'}</TableCell>
                            <TableCell>
                              {userItem.createdAt && userItem.createdAt.seconds ? 
                                format(
                                  new Date(userItem.createdAt.seconds * 1000),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                ) : "-"
                              }
                            </TableCell>
                            <TableCell>
                              {userItem.lastLogin && userItem.lastLogin.seconds ? 
                                format(
                                  new Date(userItem.lastLogin.seconds * 1000),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR }
                                ) : "-"
                              }
                            </TableCell>
                            <TableCell>
                              {userItem.isAdmin ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant={userItem.isAdmin ? "destructive" : "default"}
                                size="sm"
                                onClick={() => handleToggleAdmin(userItem.uid, userItem.isAdmin)}
                                disabled={updatingUser === userItem.uid || userItem.uid === user?.uid}
                              >
                                {updatingUser === userItem.uid ? (
                                  "Atualizando..."
                                ) : userItem.isAdmin ? (
                                  "Remover Admin"
                                ) : (
                                  "Tornar Admin"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Nenhum usuário encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending-users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Aprovação de Usuários</CardTitle>
                  <CardDescription>
                    Gerencie os pedidos de acesso à plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Não há usuários pendentes de aprovação.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>Lista de usuários aguardando aprovação</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data de Cadastro</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((pendingUser) => (
                          <TableRow key={pendingUser.uid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {pendingUser.photoURL ? (
                                  <Avatar>
                                    <AvatarImage src={pendingUser.photoURL} alt={pendingUser.displayName || ''} />
                                    <AvatarFallback>{pendingUser.displayName?.substring(0, 2) || 'U'}</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar>
                                    <AvatarFallback>{pendingUser.displayName?.substring(0, 2) || 'U'}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  <p>{pendingUser.displayName || 'Sem nome'}</p>
                                  <p className="text-xs text-muted-foreground">Cadastrado via {pendingUser.authProvider}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{pendingUser.email || '-'}</TableCell>
                            <TableCell>
                              {pendingUser.createdAt && pendingUser.createdAt.seconds
                                ? format(new Date(pendingUser.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveUser(pendingUser.uid)}
                                  disabled={processingAction === pendingUser.uid}
                                >
                                  {processingAction === pendingUser.uid ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                  )}
                                  Aprovar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="hover:bg-red-100 hover:text-red-700 hover:border-red-700"
                                  onClick={() => handleRejectUser(pendingUser.uid)}
                                  disabled={processingAction === pendingUser.uid}
                                >
                                  {processingAction === pendingUser.uid ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 mr-1" />
                                  )}
                                  Rejeitar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Nova aba de Configurações do Sistema */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Gerencie as configurações da aplicação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Nome do Bebê */}
                    <div className="space-y-2">
                      <Label htmlFor="babyName">Nome do Bebê</Label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="babyName" 
                          value={settings?.babyName || ''} 
                          onChange={(e) => setSettings({...settings, babyName: e.target.value} as AppSettings)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                    </div>
                    
                    {/* Data Esperada de Nascimento */}
                    <div className="space-y-2">
                      <Label htmlFor="expectedDate">Data Esperada de Nascimento</Label>
                      <div className="grid gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {settings?.expectedBirthDate ? (
                                format(
                                  new Date(settings.expectedBirthDate.seconds * 1000),
                                  "PPP",
                                  { locale: ptBR }
                                )
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={settings?.expectedBirthDate ? new Date(settings.expectedBirthDate.seconds * 1000) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setSettings({
                                    ...settings,
                                    expectedBirthDate: Timestamp.fromDate(date)
                                  } as AppSettings);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    {/* Data da Última Menstruação (DUM) */}
                    <div className="space-y-2">
                      <Label htmlFor="lastMenstruationDate">Data da Última Menstruação (DUM) ou último ultrassom</Label>
                      <div className="grid gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {settings?.lastMenstruationDate ? (
                                format(
                                  new Date(settings.lastMenstruationDate.seconds * 1000),
                                  "PPP",
                                  { locale: ptBR }
                                )
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={settings?.lastMenstruationDate ? new Date(settings.lastMenstruationDate.seconds * 1000) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setSettings({
                                    ...settings,
                                    lastMenstruationDate: Timestamp.fromDate(date)
                                  } as AppSettings);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Esta data será usada para calcular a idade gestacional e o countup após o nascimento.
                      </p>
                    </div>
                    
                    {/* Permitir Palpites */}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="allowGuesses" 
                        checked={settings?.allowGuesses || false}
                        onChange={(e) => setSettings({...settings, allowGuesses: e.target.checked} as AppSettings)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="allowGuesses">Permitir novos palpites</Label>
                    </div>
                    
                    {/* Mostrar Contagem Regressiva */}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="showCountdown" 
                        checked={settings?.showCountdown || false}
                        onChange={(e) => setSettings({...settings, showCountdown: e.target.checked} as AppSettings)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="showCountdown">Mostrar contagem regressiva</Label>
                    </div>
                    
                    {/* Botão para salvar configurações */}
                    <Button 
                      onClick={async () => {
                        try {
                          await updateAppSettings(settings as AppSettings);
                          toast.success("Configurações atualizadas com sucesso");
                        } catch (error) {
                          console.error("Erro ao atualizar configurações:", error);
                          toast.error("Erro ao atualizar configurações");
                        }
                      }}
                      className="mt-4"
                    >
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-xl font-semibold">Bem-vindo, {userProfile.displayName || user.email}!</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(true)}
              disabled={updatingDate}
            >
              {settings?.actualBirthDate ? "Alterar data real" : "Definir data real"}
            </Button>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{settings?.actualBirthDate ? "Alterar data real" : "Definir data real"} de nascimento</DialogTitle>
                <DialogDescription>
                  {settings?.actualBirthDate 
                    ? "Alterar a data real de nascimento vai recalcular o vencedor do palpite." 
                    : "Definir a data real de nascimento vai determinar o vencedor do palpite."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="birthdate">Data de nascimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="birthdate"
                          variant="outline"
                          className="justify-start text-left font-normal w-full"
                        >
                          {actualBirthDate ? (
                            format(actualBirthDate, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={actualBirthDate}
                          onSelect={(date) => setActualBirthDate(date || undefined)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {showWinnerResult && winnerResult && (
                    <Alert className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Palpite vencedor encontrado!</AlertTitle>
                      <AlertDescription>
                        <p><strong>{winnerResult.winner.userName}</strong> foi o vencedor com a data <strong>{format(new Date(winnerResult.winner.guessDate.seconds * 1000), "dd/MM/yyyy")}</strong>.</p>
                        <p className="text-xs text-muted-foreground mt-1">Diferença: {winnerResult.formattedDifference}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSetActualBirthDate} 
                  disabled={!actualBirthDate || updatingDate}
                >
                  {updatingDate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Confirmar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir em massa</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja excluir os palpites selecionados? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={async () => {
                    setIsDeletingMultiple(true);
                    try {
                      await deleteManyGuesses(selectedGuesses);
                      toast.success("Palpites excluídos com sucesso");
                      const updatedGuesses = guesses.filter(g => !selectedGuesses.includes(g.id));
                      setGuesses(updatedGuesses);
                      setSelectedGuesses([]);
                    } catch (error) {
                      console.error("Erro ao excluir palpites em massa:", error);
                      toast.error("Erro ao excluir palpites em massa");
                    } finally {
                      setIsDeletingMultiple(false);
                      setIsBulkDeleteDialogOpen(false);
                    }
                  }}
                  disabled={isDeletingMultiple}
                >
                  {isDeletingMultiple ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Diálogo de exportação */}
          <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exportar Palpites</AlertDialogTitle>
                <AlertDialogDescription>
                  Escolha o formato para exportar os palpites. O arquivo será nomeado com a data atual para facilitar a identificação.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => {
                    exportGuessesToCSV();
                    setIsExportDialogOpen(false);
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold">CSV</span>
                    <span className="text-xs text-muted-foreground mt-1">Planilhas Excel, Google Sheets</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => {
                    exportGuessesToJSON();
                    setIsExportDialogOpen(false);
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold">JSON</span>
                    <span className="text-xs text-muted-foreground mt-1">Formato de dados estruturados</span>
                  </div>
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Diálogo de importação */}
          <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar Palpites</AlertDialogTitle>
                <AlertDialogDescription>
                  Faça upload de um arquivo CSV ou JSON contendo palpites para importar.
                  O formato deve corresponder à estrutura dos dados de palpite.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => {
                    // Implementação atual para CSV
                    setAddingBulkGuesses(true);
                    setIsImportDialogOpen(false);
                    // Redireciona para o fluxo atual de adição em massa
                    document.getElementById('csv-input')?.click();
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold">CSV</span>
                    <span className="text-xs text-muted-foreground mt-1">Upload de arquivo CSV</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => {
                    // Implementação atual para JSON
                    setAddingBulkGuesses(true);
                    setIsImportDialogOpen(false);
                    // Redireciona para o fluxo atual de adição em massa
                    document.getElementById('json-input')?.click();
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold">JSON</span>
                    <span className="text-xs text-muted-foreground mt-1">Upload de arquivo JSON</span>
                  </div>
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Inputs ocultos para upload de arquivos */}
          <input 
            type="file" 
            id="csv-input" 
            accept=".csv" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'csv')}
          />
          <input 
            type="file" 
            id="json-input" 
            accept=".json" 
            className="hidden" 
            onChange={(e) => handleFileImport(e, 'json')}
          />
        </>
      )}
    </main>
  );
}
