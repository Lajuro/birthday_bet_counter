'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Users, 
  Trash2, 
  CheckCircle,
  Edit, 
  Settings,
  ListPlus,
  PlusCircle,
  Check as CheckIcon,
  UserCheck,
  Loader2,
  CalendarIcon,
  Save,
  Baby,
  CalendarDays,
  Settings2,
  Plus,
  Trophy,
  BarChart3,
  XCircle,
  X
} from 'lucide-react';
import { getAllGuesses, getAppSettings, updateAppSettings, deleteGuess, deleteManyGuesses, getAllUsers, updateUserProfile, determineWinner, WinnerResult, getPendingUsers, approveUser, rejectUser, createBulkGuess, serverTimestamp } from '@/lib/firebase/firestore';
import { BirthGuess, AppSettings, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Timestamp } from 'firebase/firestore';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase/config';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isGuessDialogOpen, setIsGuessDialogOpen] = useState(false);
  const [newGuess, setNewGuess] = useState<{
    userName: string;
    comment: string;
    date: Date | undefined;
  }>({
    userName: '',
    comment: '',
    date: undefined
  });
  const [guessesByDate, setGuessesByDate] = useState<BirthGuess[]>([]);
  const [isCreatingGuess, setIsCreatingGuess] = useState(false);
  const [addingBulkGuesses, setAddingBulkGuesses] = useState(false);
  const [currentGuessInfo, setCurrentGuessInfo] = useState<{index: number, total: number, name: string} | null>(null);
  const [showWinnerResult, setShowWinnerResult] = useState(false);
  const [selectedGuesses, setSelectedGuesses] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [deletingGuess, setDeletingGuess] = useState<string | null>(null);
  const [winnerResult, setWinnerResult] = useState<WinnerResult | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

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

  const handleRemoveActualBirthDate = async () => {
    if (!settings) return;
    
    setUpdatingDate(true);
    setShowWinnerResult(false);
    
    try {
      // Criar um objeto sem tipar como AppSettings para usar o deleteField()
      const updateData = {
        actualBirthDate: deleteField(),
        updatedAt: serverTimestamp()
      };
      
      // Atualizar no Firestore sem especificar a tipagem
      const settingsRef = doc(db, 'settings', 'app');
      await updateDoc(settingsRef, updateData);
      
      toast.success('Data de nascimento removida com sucesso!');
      
      // Atualizar o estado local sem a data de nascimento
      const updatedSettings = { ...settings };
      delete updatedSettings.actualBirthDate;
      setSettings(updatedSettings);
      
      // Limpar os dados do vencedor
      setWinnerResult(null);
      // Fechar o diálogo
      setIsOpen(false);
      // Limpar a data selecionada
      setActualBirthDate(undefined);
    } catch (error) {
      console.error('Erro ao remover data de nascimento:', error);
      toast.error('Erro ao remover data de nascimento.');
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
            comment?: string;
          } = {
            userName: guess.name + (guess.relation ? ` (${guess.relation})` : ''),
            guessDate: Timestamp.fromDate(guessDate),
            userId: user.uid,
            createdAt: serverTimestamp()
          };
          
          // Adicionar campos opcionais apenas se tiverem valores válidos
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
    const headers = ['Nome', 'Data', 'Comentário'];
    let csvContent = headers.join(',') + '\n';
    
    // Adicionar dados
    guesses.forEach(guess => {
      const dateStr = guess.guessDate && guess.guessDate.seconds 
        ? format(
          new Date(guess.guessDate.seconds * 1000),
          "dd/MM/yyyy HH:mm",
          { locale: ptBR }
        ) : '-';
      
      // Escapar vírgulas e aspas nos dados
      const row = [
        `"${guess.userName.replace(/"/g, '""')}"`,
        `"${dateStr}"`,
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

  const handleDateSelect = (date: Date | undefined) => {
    setNewGuess({...newGuess, date});
    
    if (date) {
      // Filtrar os palpites que têm a mesma data
      const formattedSelectedDate = format(date, 'yyyy-MM-dd');
      const matchingGuesses = guesses.filter(guess => {
        // Convertemos a data do palpite para o mesmo formato para comparação
        const guessDate = guess.guessDate.toDate();
        const formattedGuessDate = format(guessDate, 'yyyy-MM-dd');
        return formattedGuessDate === formattedSelectedDate;
      });
      
      setGuessesByDate(matchingGuesses);
    } else {
      setGuessesByDate([]);
    }
  };

  const handleAddGuess = async () => {
    if (!newGuess.userName || !newGuess.date) {
      toast.error("Por favor, preencha o nome e a data");
      return;
    }

    setIsCreatingGuess(true);

    try {
      // Criar um objeto com os dados do palpite
      const guessData = {
        userName: newGuess.userName,
        userId: "admin_created", // Como é criado pelo admin, usamos um ID especial
        guessDate: Timestamp.fromDate(newGuess.date), // Corrigido de 'date' para 'guessDate'
        comment: newGuess.comment || undefined
      };

      // Adicionar o palpite ao Firestore
      await createBulkGuess(guessData);

      // Recarregar os palpites
      const updatedGuesses = await getAllGuesses();
      setGuesses(updatedGuesses);

      // Limpar o formulário e fechar o modal
      setNewGuess({
        userName: '',
        comment: '',
        date: undefined
      });
      setGuessesByDate([]);
      setIsGuessDialogOpen(false);
      
      toast.success("Palpite criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar palpite:", error);
      toast.error("Erro ao criar palpite. Tente novamente.");
    } finally {
      setIsCreatingGuess(false);
    }
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
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-lg mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              {userProfile.photoURL ? (
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName || ''} />
                  <AvatarFallback>{userProfile.displayName?.substring(0, 2) || user.email?.substring(0, 2)}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-12 w-12 bg-primary/20">
                  <AvatarFallback className="text-primary">{userProfile.displayName?.substring(0, 2) || user.email?.substring(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-xl font-semibold">Bem-vindo, {userProfile.displayName || user.email}!</h2>
                <p className="text-muted-foreground text-sm">Painel de Administração • {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(true)}
              disabled={updatingDate}
              className="bg-background border-primary/20 hover:bg-primary/10"
            >
              {settings?.actualBirthDate ? "Alterar data real" : "Definir data real"}
            </Button>
          </div>
          
          <Tabs defaultValue="guesses" className="mt-6">
            <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4">
              <TabsList className="h-auto p-0 bg-transparent gap-2 flex-nowrap min-w-max">
                <TabsTrigger 
                  value="guesses" 
                  className="relative h-12 px-4 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Palpites</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="relative h-12 px-4 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Usuários</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="pending-users" 
                  className="relative h-12 px-4 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <span className="whitespace-nowrap">Aprovação de Usuários</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="relative h-12 px-4 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none cursor-pointer transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="guesses" className="mt-0 shadow-none border-none">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Todos os Palpites</CardTitle>
                      <CardDescription>
                        {guesses.length} palpites registrados
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={() => setIsGuessDialogOpen(true)}
                        disabled={loading}
                        className="cursor-pointer flex-grow sm:flex-grow-0"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Palpite
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setIsImportDialogOpen(true)}
                        disabled={addingBulkGuesses}
                        className="flex-grow sm:flex-grow-0"
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
                        className="flex-grow sm:flex-grow-0"
                      >
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                        disabled={isDeletingMultiple || selectedGuesses.length === 0}
                        className="flex-grow sm:flex-grow-0"
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
                  <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
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
                              <TableCell className="font-medium whitespace-nowrap">{guess.userName}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {guess.guessDate && guess.guessDate.seconds ? 
                                  format(
                                    new Date(guess.guessDate.seconds * 1000),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR }
                                  ) : "-"
                                }
                              </TableCell>
                              <TableCell className="max-w-[120px] md:max-w-xs truncate">
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
                            <TableCell colSpan={5} className="text-center py-4">
                              Nenhum palpite registrado ainda.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-0 shadow-none border-none">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <CardDescription>
                    Administre os usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
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
                              <TableCell className="font-medium whitespace-nowrap">
                                {userItem.displayName || 'Usuário sem nome'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{userItem.email || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {userItem.createdAt && userItem.createdAt.seconds ? 
                                  format(
                                    new Date(userItem.createdAt.seconds * 1000),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  ) : "-"
                                }
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Nova aba de Configurações do Sistema */}
            <TabsContent value="settings" className="mt-0 shadow-none border-none">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-0">
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Gerencie as configurações principais do sistema de palpites.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8 px-1">
                    {/* Seção de Informações do Bebê */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Baby className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Informações do Bebê</h3>
                      </div>
                      <Separator className="my-2" />
                      
                      {/* Nome do Bebê */}
                      <div className="space-y-2">
                        <Label htmlFor="babyName" className="text-sm font-medium">
                          Nome do Bebê
                        </Label>
                        <Input
                          id="babyName"
                          value={settings?.babyName || ''}
                          onChange={(e) => setSettings({...settings, babyName: e.target.value} as AppSettings)}
                          placeholder="Nome do bebê"
                          className="max-w-md"
                        />
                        <p className="text-sm text-muted-foreground">
                          Este nome será exibido em toda a aplicação.
                        </p>
                      </div>
                      
                      {/* Botão para definir data real */}
                      <div className="pt-1">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between max-w-md">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Data de Nascimento</h4>
                              <p className="text-sm text-muted-foreground">
                                {settings?.actualBirthDate 
                                  ? `Definida para ${format(new Date(settings.actualBirthDate.seconds * 1000), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                                  : "Ainda não definida"}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                if (settings?.actualBirthDate) {
                                  setActualBirthDate(new Date(settings.actualBirthDate.seconds * 1000));
                                }
                                setIsOpen(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              {settings?.actualBirthDate ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              {settings?.actualBirthDate ? "Alterar" : "Definir"}
                            </Button>
                          </div>
                          {settings?.actualBirthDate && (
                            <div className="flex gap-2 max-w-md mt-1">
                              <Badge variant="outline" className="bg-primary/10 text-primary text-xs font-normal">
                                <Trophy className="h-3 w-3 mr-1" />
                                Vencedor definido
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Seção de Datas Previstas */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Datas Previstas</h3>
                      </div>
                      <Separator className="my-2" />
                      
                      {/* Data Prevista de Nascimento */}
                      <div className="space-y-2">
                        <Label htmlFor="expectedBirthDate" className="text-sm font-medium">
                          Data Prevista de Nascimento (DPP)
                        </Label>
                        <div className="grid gap-2 max-w-md">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="expectedBirthDate"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {settings?.expectedBirthDate ? (
                                  format(
                                    new Date(settings.expectedBirthDate.seconds * 1000),
                                    "dd 'de' MMMM 'de' yyyy",
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
                                locale={ptBR}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Esta é a data estimada pelo médico para o nascimento.
                        </p>
                      </div>
                      
                      {/* Data da Última Menstruação (DUM) */}
                      <div className="space-y-2">
                        <Label htmlFor="lastMenstruationDate" className="text-sm font-medium">
                          Data da Última Menstruação (DUM) ou último ultrassom
                        </Label>
                        <div className="grid gap-2 max-w-md">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="lastMenstruationDate"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {settings?.lastMenstruationDate ? (
                                  format(
                                    new Date(settings.lastMenstruationDate.seconds * 1000),
                                    "dd 'de' MMMM 'de' yyyy",
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
                                locale={ptBR}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Esta data será usada para calcular a idade gestacional e o countup após o nascimento.
                        </p>
                      </div>
                    </div>
                    
                    {/* Seção de Comportamento do Sistema */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Comportamento do Sistema</h3>
                      </div>
                      <Separator className="my-2" />
                      
                      {/* Opções de Comportamento */}
                      <div className="space-y-4 max-w-md">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="allowGuesses" className="text-sm font-medium">
                              Permitir novos palpites
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Quando ativado, os usuários podem criar novos palpites.
                            </p>
                          </div>
                          <Switch
                            id="allowGuesses"
                            checked={settings?.allowGuesses || false}
                            onCheckedChange={(checked) => setSettings({...settings, allowGuesses: checked} as AppSettings)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showCountdown" className="text-sm font-medium">
                              Mostrar contagem regressiva
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Quando ativado, exibe um contador na página inicial.
                            </p>
                          </div>
                          <Switch
                            id="showCountdown"
                            checked={settings?.showCountdown || false}
                            onCheckedChange={(checked) => setSettings({...settings, showCountdown: checked} as AppSettings)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Botão para salvar configurações */}
                    <div className="pt-2">
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">Salvar alterações</h4>
                              <p className="text-sm text-muted-foreground">
                                Aplique todas as alterações realizadas nas configurações.
                              </p>
                            </div>
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
                              className="gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Salvar Configurações
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending-users" className="mt-0 shadow-none border-none">
              <Card className="border-none shadow-md">
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
                    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                      <Table>
                        <TableCaption>Lista de usuários aguardando aprovação</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Data de Solicitação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingUsers.map((pendingUser) => (
                            <TableRow key={pendingUser.uid}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {pendingUser.displayName || 'Usuário sem nome'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{pendingUser.email || '-'}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {pendingUser.createdAt && pendingUser.createdAt.seconds
                                  ? format(new Date(pendingUser.createdAt.seconds * 1000), 'dd/MM/yyyy', { locale: ptBR })
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleApproveUser(pendingUser.uid)}
                                    disabled={processingAction === pendingUser.uid}
                                    className="flex-grow sm:flex-grow-0"
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
                                    className="hover:bg-red-100 hover:text-red-700 hover:border-red-700 flex-grow sm:flex-grow-0"
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                {settings?.actualBirthDate && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveActualBirthDate}
                    disabled={updatingDate}
                  >
                    {updatingDate ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Data
                      </>
                    )}
                  </Button>
                )}
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
          <Dialog open={isGuessDialogOpen} onOpenChange={setIsGuessDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Novo Palpite</DialogTitle>
                <DialogDescription>
                  Adicione um novo palpite para o nascimento {settings?.babyName ? `da ${settings.babyName}` : ''}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nome do usuário</Label>
                    <input 
                      type="text" 
                      id="userName" 
                      value={newGuess.userName} 
                      onChange={(e) => setNewGuess({...newGuess, userName: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Nome do participante"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Data do palpite</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newGuess.date && "text-muted-foreground"
                          )}
                        >
                          {newGuess.date ? (
                            format(newGuess.date, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newGuess.date}
                          onSelect={handleDateSelect}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Mostrar quem já selecionou essa data */}
                    {guessesByDate.length > 0 && (
                      <div className="mt-3 p-3 bg-secondary/30 rounded-md">
                        <p className="text-sm font-medium mb-2 text-secondary-foreground">
                          {guessesByDate.length} {guessesByDate.length === 1 ? 'pessoa já escolheu' : 'pessoas já escolheram'} esta data:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {guessesByDate.map((guess, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              <span>{guess.userName}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comment">Comentário</Label>
                    <textarea 
                      id="comment" 
                      value={newGuess.comment} 
                      onChange={(e) => setNewGuess({...newGuess, comment: e.target.value})}
                      placeholder="Adicione um comentário (opcional)"
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsGuessDialogOpen(false);
                    setNewGuess({
                      userName: '',
                      comment: '',
                      date: undefined
                    });
                    setGuessesByDate([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddGuess} 
                  disabled={isCreatingGuess || !newGuess.userName || !newGuess.date}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreatingGuess ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Criar Palpite
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
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
