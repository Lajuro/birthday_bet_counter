/* eslint-disable @typescript-eslint/no-unused-vars */

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
  X,
  CreditCard,
  PhoneIcon,
  Search,
  MessageCircle,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { 
  createGuess, 
  createBulkGuess, 
  getAllGuesses, 
  getAppSettings, 
  getAllUsers, 
  updateUserProfile,
  updateGuess,
  deleteGuess as deleteGuessFunc,
  deleteManyGuesses,
  approveUser,
  rejectUser,
  updateAppSettings,
  determineWinner,
  WinnerResult,
  getPendingUsers,
  serverTimestamp
} from '@/lib/firebase/firestore';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

export default function AdminPage() {
  const { user, userProfile, isLoading } = useAuth();
  const router = useRouter();
  const [guesses, setGuesses] = useState<BirthGuess[]>([]);
  const [selectedGuesses, setSelectedGuesses] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<BirthGuess | null>(null);
  const [deletingGuess, setDeletingGuess] = useState<string | null>(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [_isEditingSettings, _setIsEditingSettings] = useState(false);
  const [_isUpdatingSettings, _setIsUpdatingSettings] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [_activeTab, _setActiveTab] = useState("guesses");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BirthGuess | null;
    direction: 'ascending' | 'descending';
  }>({ key: 'guessDate', direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState<{
    dateRange: { from?: Date; to?: Date } | null;
    showWithComments: boolean | null;
  }>({ dateRange: null, showWithComments: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGuesses, setFilteredGuesses] = useState<BirthGuess[]>([]);
  const [winnerResult, setWinnerResult] = useState<WinnerResult | null>(null);
  const [showWinnerResult, setShowWinnerResult] = useState(false);
  const [_loading, _setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isGuessDialogOpen, setIsGuessDialogOpen] = useState(false);
  const [isCreatingGuess, setIsCreatingGuess] = useState(false);
  const [_updatingDate, _setUpdatingDate] = useState(false);
  const [actualBirthDate, setActualBirthDate] = useState<Date | undefined>(undefined);
  const [newGuess, setNewGuess] = useState({ userName: '', comment: '', date: undefined as Date | undefined });
  const [_addingBulkGuesses, _setAddingBulkGuesses] = useState(false);
  const [_currentGuessInfo, _setCurrentGuessInfo] = useState<{index: number, total: number, name: string} | null>(null);
  const [isImportingFile, setIsImportingFile] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
    completed: boolean;
    success: number;
    errors: number;
  }>({ current: 0, total: 0, currentName: '', completed: false, success: 0, errors: 0 });

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
        }
      }
    }

    fetchData();
  }, [user, userProfile, isLoading, router]);

  useEffect(() => {
    if (!guesses.length) {
      setFilteredGuesses([]);
      return;
    }

    let result = [...guesses];
    
    // Filtragem por termo de pesquisa
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.trim().toLowerCase();
      result = result.filter(guess => 
        guess.userName.toLowerCase().includes(searchTermLower) || 
        (guess.comment && guess.comment.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Filtragem por intervalo de datas
    if (filterConfig.dateRange && (filterConfig.dateRange.from || filterConfig.dateRange.to)) {
      result = result.filter(guess => {
        if (!guess.guessDate) return false;
        
        const guessDate = new Date(guess.guessDate.seconds * 1000);
        let include = true;
        
        if (filterConfig.dateRange?.from) {
          const fromDate = new Date(filterConfig.dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          include = include && guessDate >= fromDate;
        }
        
        if (filterConfig.dateRange?.to) {
          const toDate = new Date(filterConfig.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          include = include && guessDate <= toDate;
        }
        
        return include;
      });
    }
    
    // Filtragem por presença de comentários
    if (filterConfig.showWithComments !== null) {
      if (filterConfig.showWithComments) {
        // Mostrar apenas com comentários
        result = result.filter(guess => guess.comment && guess.comment.trim().length > 0);
      } else {
        // Mostrar apenas sem comentários
        result = result.filter(guess => !guess.comment || guess.comment.trim().length === 0);
      }
    }
    
    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Tratamento especial para ordenação de data
        if (sortConfig.key === 'guessDate') {
          // Verificar se os objetos têm a propriedade guessDate
          if (!a.guessDate || !b.guessDate) {
            return 0; // Manter a ordem se algum não tiver data
          }
          
          const dateA = new Date(a.guessDate.seconds * 1000);
          const dateB = new Date(b.guessDate.seconds * 1000);
          
          return sortConfig.direction === 'ascending' 
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        } else if (sortConfig.key === 'userName' || sortConfig.key === 'comment') {
          // Ordenação de texto (case insensitive)
          const valueA = (a[sortConfig.key] || '').toLowerCase();
          const valueB = (b[sortConfig.key] || '').toLowerCase();
          
          return sortConfig.direction === 'ascending'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        
        return 0;
      });
    }
    
    setFilteredGuesses(result);
  }, [guesses, sortConfig, filterConfig, searchTerm]);

  const handleSetActualBirthDate = async () => {
    if (!actualBirthDate || !settings) return;

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
    }
  };

  const handleRemoveActualBirthDate = async () => {
    if (!settings) return;
    
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
    }
  };

  const handleDeleteGuess = async (guessId: string) => {
    setDeletingGuess(guessId);
    try {
      await deleteGuessFunc(guessId);
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
      return;
    }

    const file = event.target.files[0];
    setIsImportingFile(true);
    
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target?.result) {
        toast.error("Erro ao ler o arquivo");
        setIsImportingFile(false);
        return;
      }

      try {
        let guessesToAdd: {name: string; date: string; relation?: string; weight?: string; height?: string; comment?: string}[] = [];
        
        if (format === 'csv') {
          // Processar CSV
          const content = e.target.result as string;
          const lines = content.split('\n');
          
          if (lines.length > 1) {
            // Pegar o cabeçalho e remover espaços em branco e aspas
            const headers = lines[0].split(',').map(h => 
              h.trim().replace(/^"(.*)"$/, '$1').toLowerCase() // Remover aspas e converter para minúsculo
            );
            
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
              }
            }
          }
        } else if (format === 'json') {
          // Processar JSON
          try {
            const content = e.target.result as string;
            const jsonData = JSON.parse(content);
            
            if (Array.isArray(jsonData)) {
              guessesToAdd = jsonData.map(item => {
                const processedItem = {
                  name: item.userName || item.name || '',
                  date: item.date || '',
                  relation: item.relation || undefined,
                  comment: item.comment || undefined
                };
                return processedItem;
              }).filter(item => item.name && item.date);
            } else if (typeof jsonData === 'object' && jsonData !== null) {
              const singleItem = {
                name: jsonData.userName || jsonData.name || '',
                date: jsonData.date || '',
                relation: jsonData.relation || undefined,
                comment: jsonData.comment || undefined
              };
              
              if (singleItem.name && singleItem.date) {
                guessesToAdd = [singleItem];
              }
            }
          } catch (jsonError) {
            console.error("Erro ao processar JSON:", jsonError);
            toast.error("Formato de JSON inválido");
            setIsImportingFile(false);
            return;
          }
        }
        
        if (guessesToAdd.length === 0) {
          toast.error("Nenhum palpite válido encontrado no arquivo");
          setIsImportingFile(false);
          return;
        }

        // Inicializar progresso
        setImportProgress({
          current: 0,
          total: guessesToAdd.length,
          currentName: '',
          completed: false,
          success: 0,
          errors: 0
        });

        let successCount = 0;
        let errorCount = 0;

        // Processar cada palpite da lista
        for (let i = 0; i < guessesToAdd.length; i++) {
          const guess = guessesToAdd[i];
          
          // Atualizar progresso
          setImportProgress(prev => ({
            ...prev,
            current: i + 1,
            currentName: guess.name
          }));
          
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
          
          // Adicionar o palpite ao Firestore
          try {
            await createBulkGuess(newGuess);
            successCount++;
            setImportProgress(prev => ({
              ...prev,
              success: prev.success + 1
            }));
          } catch (error) {
            console.error(`Erro ao criar palpite para ${guess.name}:`, error);
            errorCount++;
            setImportProgress(prev => ({
              ...prev,
              errors: prev.errors + 1
            }));
          }
          
          // Pequena pausa entre operações para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Marcar como concluído
        setImportProgress(prev => ({
          ...prev,
          completed: true
        }));
        
        // Recarregar os palpites após adicionar todos
        await fetchGuesses();
        
        if (successCount > 0) {
          toast.success(`${successCount} palpites importados com sucesso!`);
        }
        
        if (errorCount > 0) {
          toast.error(`${errorCount} palpites não puderam ser importados.`);
        }
        
        // Aguardar um pouco para que o usuário veja o resultado final
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error("Erro ao importar palpites:", error);
        toast.error("Erro ao importar palpites do arquivo");
      } finally {
        // Limpar o input file
        if (event.target) {
          event.target.value = '';
        }
        setIsImportingFile(false);
      }
    };
    
    reader.onerror = () => {
      console.error("Erro ao ler o arquivo");
      toast.error("Erro ao ler o arquivo");
      setIsImportingFile(false);
    };
    
    reader.readAsText(file);
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
      const rangeGuessIds = filteredGuesses.slice(start, end + 1).map(g => g.id);
      
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

  const handleAddGuess = async () => {
    if (!newGuess.userName || !newGuess.date || !user) return;

    setIsCreatingGuess(true);

    try {
      // Criar um objeto com os dados do palpite
      const guessData = {
        userName: newGuess.userName,
        userId: user.uid,
        guessDate: Timestamp.fromDate(newGuess.date),
        comment: newGuess.comment || ''
      };
      
      // Criar o palpite no Firestore (retorna o objeto completo do palpite)
      const createdGuess = await createGuess(guessData);
      
      if (createdGuess) {
        // Adicionar o novo palpite à lista local
        const updatedGuesses = [...guesses, createdGuess];
        setGuesses(updatedGuesses);
        
        toast.success("Palpite criado com sucesso!");
        
        // Limpar o formulário e fechar o modal
        setNewGuess({
          userName: '',
          comment: '',
          date: undefined
        });
        setIsGuessDialogOpen(false);
      }
    } catch (error: unknown) {
      console.error("Erro ao criar palpite:", error);
      
      if (error instanceof Error && error.message?.includes("já existe")) {
        toast.error("Este usuário já tem um palpite para esta data.");
      } else {
        toast.error("Erro ao criar palpite. Tente novamente.");
      }
    } finally {
      setIsCreatingGuess(false);
    }
  };

  const handleEditGuess = async () => {
    if (!selectedGuess || !selectedGuess.guessDate) return;

    setIsCreatingGuess(true);

    try {
      // Criar um objeto com os dados do palpite atualizado
      const guessData = {
        userName: selectedGuess.userName,
        guessDate: selectedGuess.guessDate,
        comment: selectedGuess.comment || ''
      };
      
      // Chamar a função para atualizar o palpite no Firestore
      await updateGuess(selectedGuess.id, guessData);
      
      // Atualizar o estado local dos palpites
      const updatedGuesses = guesses.map(g => 
        g.id === selectedGuess.id ? {
          ...g,
          userName: selectedGuess.userName,
          guessDate: selectedGuess.guessDate,
          comment: selectedGuess.comment,
          updatedAt: Timestamp.fromDate(new Date())
        } : g
      );
      setGuesses(updatedGuesses);

      // Limpar o formulário e fechar o modal
      setSelectedGuess(null);
      setNewGuess({ userName: '', comment: '', date: undefined });
      setIsGuessDialogOpen(false);
      
      toast.success("Palpite atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar palpite:', error);
      toast.error("Erro ao atualizar palpite. Tente novamente.");
    } finally {
      setIsCreatingGuess(false);
    }
  };

  const handleSort = (key: keyof BirthGuess) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterConfig({ dateRange: null, showWithComments: null });
    setSortConfig({ key: null, direction: 'ascending' });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedGuesses.length === filteredGuesses.length) {
      // Se todos já estão selecionados, desseleciona todos
      setSelectedGuesses([]);
    } else {
      // Caso contrário, seleciona todos os filtrados
      setSelectedGuesses(filteredGuesses.map(g => g.id));
    }
  };

  if (isLoading) {
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
              className="bg-background border-primary/20 hover:bg-primary/10 cursor-pointer"
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
                        className="cursor-pointer flex-grow sm:flex-grow-0"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Palpite
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setIsImportDialogOpen(true)}
                        className="flex-grow sm:flex-grow-0 cursor-pointer"
                      >
                        <ListPlus className="mr-2 h-4 w-4" />
                        Importar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsExportDialogOpen(true)}
                        className="flex-grow sm:flex-grow-0 cursor-pointer"
                      >
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsBulkDeleteDialogOpen(true)}
                        disabled={isDeletingMultiple || selectedGuesses.length === 0}
                        className="flex-grow sm:flex-grow-0 cursor-pointer"
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
                  <div className="mb-6 space-y-4">
                    {/* Barra de pesquisa e filtros */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Pesquisar por nome ou comentário..."
                          className="w-full pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 flex-1 justify-end">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="cursor-pointer">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Filtrar por data
                              {filterConfig.dateRange && (filterConfig.dateRange.from || filterConfig.dateRange.to) && (
                                <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">
                                  <XCircle className="h-3 w-3 mr-1" />
                                </Badge>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="range"
                              selected={{
                                from: filterConfig.dateRange?.from || undefined,
                                to: filterConfig.dateRange?.to || undefined
                              }}
                              onSelect={(range) => 
                                setFilterConfig({
                                  ...filterConfig,
                                  dateRange: range || null
                                })
                              }
                              numberOfMonths={2}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Comentários
                              {filterConfig.showWithComments !== null && (
                                <Badge variant="secondary" className="ml-2 bg-secondary text-secondary-foreground">
                                  <XCircle className="h-3 w-3 mr-1" />
                                </Badge>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuRadioGroup 
                              value={filterConfig.showWithComments === null 
                                ? "all" 
                                : filterConfig.showWithComments ? "with" : "without"
                              }
                              onValueChange={(value) => {
                                setFilterConfig({
                                  ...filterConfig,
                                  showWithComments: value === "all" 
                                    ? null 
                                    : value === "with" ? true : false
                                });
                              }}
                            >
                              <DropdownMenuRadioItem value="all" className="cursor-pointer">Todos</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="with" className="cursor-pointer">Com comentários</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="without" className="cursor-pointer">Sem comentários</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {(searchTerm || filterConfig.dateRange || filterConfig.showWithComments !== null || sortConfig.key) && (
                          <Button 
                            variant="ghost" 
                            onClick={clearFilters}
                            className="cursor-pointer"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Limpar filtros
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Estatísticas e contagem */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs py-1">
                          Total: {guesses.length} palpites
                        </Badge>
                        {filteredGuesses.length !== guesses.length && (
                          <Badge variant="outline" className="text-xs py-1 bg-secondary/30">
                            Filtrados: {filteredGuesses.length} palpites
                          </Badge>
                        )}
                        {selectedGuesses.length > 0 && (
                          <Badge variant="outline" className="text-xs py-1 bg-primary/10 text-primary">
                            Selecionados: {selectedGuesses.length} palpites
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                    <Table>
                      <TableCaption>Lista de palpites para o nascimento {settings?.babyName ? `da ${settings.babyName}` : ''}</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox 
                              checked={filteredGuesses.length > 0 && selectedGuesses.length === filteredGuesses.length}
                              onCheckedChange={toggleSelectAllFiltered}
                              className="cursor-pointer"
                              aria-label="Selecionar todos os palpites"
                            />
                          </TableHead>
                          <TableHead onClick={() => handleSort('userName')} className="cursor-pointer hover:bg-secondary/20 transition-colors">
                            Usuário
                            {sortConfig.key === 'userName' && (
                              <span className="ml-2 inline-flex">
                                {sortConfig.direction === 'ascending' ? (
                                  <ArrowUpIcon className="h-4 w-4" />
                                ) : (
                                  <ArrowDownIcon className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </TableHead>
                          <TableHead onClick={() => handleSort('guessDate')} className="cursor-pointer hover:bg-secondary/20 transition-colors">
                            Data e Hora
                            {sortConfig.key === 'guessDate' && (
                              <span className="ml-2 inline-flex">
                                {sortConfig.direction === 'ascending' ? (
                                  <ArrowUpIcon className="h-4 w-4" />
                                ) : (
                                  <ArrowDownIcon className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </TableHead>
                          <TableHead onClick={() => handleSort('comment')} className="cursor-pointer hover:bg-secondary/20 transition-colors">
                            Comentário
                            {sortConfig.key === 'comment' && (
                              <span className="ml-2 inline-flex">
                                {sortConfig.direction === 'ascending' ? (
                                  <ArrowUpIcon className="h-4 w-4" />
                                ) : (
                                  <ArrowDownIcon className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGuesses.length > 0 ? (
                          filteredGuesses.map((guess, index) => (
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
                                  className="h-5 w-5 border-2 cursor-pointer"
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
                                {guess.comment ? (
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                                        {guess.comment.length > 40
                                          ? `${guess.comment.substring(0, 40)}...`
                                          : guess.comment}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <div className="text-sm font-normal">
                                        {guess.comment}
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="cursor-pointer"
                                    onClick={() => {
                                      setSelectedGuess(guess);
                                      setNewGuess({
                                        userName: guess.userName,
                                        comment: guess.comment || '',
                                        date: new Date(guess.guessDate.seconds * 1000)
                                      });
                                      setIsGuessDialogOpen(true);
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
                                        className="text-destructive cursor-pointer"
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
                                        <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-destructive hover:bg-destructive/90 cursor-pointer"
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
                              Nenhum palpite encontrado.
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
                                  className="cursor-pointer"
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
                              className="gap-1 cursor-pointer"
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
                                className="w-full justify-start text-left font-normal cursor-pointer"
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
                            <PopoverContent className="w-auto p-0" align="start">
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
                                className="w-full justify-start text-left font-normal cursor-pointer"
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
                            <PopoverContent className="w-auto p-0" align="start">
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

                        <div className="space-y-2">
                          <Label htmlFor="guessPrice" className="text-sm font-medium">
                            Valor do palpite (R$)
                          </Label>
                          <div className="flex items-center">
                            <Input
                              id="guessPrice"
                              type="number"
                              min="1"
                              step="0.01"
                              value={settings?.guessPrice || 10}
                              onChange={(e) => setSettings({...settings, guessPrice: parseFloat(e.target.value) || 10} as AppSettings)}
                              className="max-w-[120px]"
                            />
                            <p className="text-sm text-muted-foreground ml-3">
                              Valor cobrado por cada palpite.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seção de Informações de Pagamento e Contato */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Informações de Pagamento e Contato</h3>
                      </div>
                      <Separator className="my-2" />
                      
                      {/* Informações de PIX */}
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="pixKeyType" className="text-sm font-medium">
                            Tipo de Chave PIX
                          </Label>
                          <Select 
                            value={settings?.pixKeyType || 'celular'} 
                            onValueChange={(value) => setSettings({...settings, pixKeyType: value as 'celular' | 'cpf' | 'email' | 'aleatoria'} as AppSettings)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo de chave" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="celular">Celular</SelectItem>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="email">E-mail</SelectItem>
                              <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pixKey" className="text-sm font-medium">
                            Chave PIX
                          </Label>
                          <Input
                            id="pixKey"
                            type="text"
                            value={settings?.pixKey || ''}
                            onChange={(e) => setSettings({...settings, pixKey: e.target.value} as AppSettings)}
                            placeholder={
                              settings?.pixKeyType === 'celular' ? '(XX) XXXXX-XXXX' :
                              settings?.pixKeyType === 'cpf' ? 'XXX.XXX.XXX-XX' :
                              settings?.pixKeyType === 'email' ? 'exemplo@email.com' :
                              'Chave aleatória'
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            {
                              settings?.pixKeyType === 'celular' ? 'Insira o número de telefone com DDD' :
                              settings?.pixKeyType === 'cpf' ? 'Insira o CPF (somente números ou com formatação)' :
                              settings?.pixKeyType === 'email' ? 'Insira o e-mail cadastrado como chave PIX' :
                              'Insira a chave aleatória completa'
                            }
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pixName" className="text-sm font-medium">
                            Nome do Beneficiário
                          </Label>
                          <Input
                            id="pixName"
                            type="text"
                            value={settings?.pixName || ''}
                            onChange={(e) => setSettings({...settings, pixName: e.target.value} as AppSettings)}
                            placeholder="Nome completo do beneficiário"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pixBank" className="text-sm font-medium">
                            Banco
                          </Label>
                          <Input
                            id="pixBank"
                            type="text"
                            value={settings?.pixBank || ''}
                            onChange={(e) => setSettings({...settings, pixBank: e.target.value} as AppSettings)}
                            placeholder="Nome da instituição financeira"
                          />
                        </div>

                        {/* Informações de Contato */}
                        <div className="mt-6 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-4">
                            <PhoneIcon className="h-4 w-4 text-primary" />
                            <h4 className="text-md font-medium">Informações de Contato</h4>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="text-sm font-medium">
                              Número para WhatsApp
                            </Label>
                            <Input
                              id="contactPhone"
                              type="text"
                              value={settings?.contactPhone || ''}
                              onChange={(e) => setSettings({...settings, contactPhone: e.target.value} as AppSettings)}
                              placeholder="(XX) XXXXX-XXXX"
                            />
                            <p className="text-xs text-muted-foreground">
                              Este número será usado para receber os palpites via WhatsApp.
                            </p>
                          </div>
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
                                  // Garantir que o valor do palpite seja um número
                                  const updatedSettings = {
                                    ...settings,
                                    guessPrice: typeof settings?.guessPrice === 'number' ? settings.guessPrice : 10
                                  } as AppSettings;
                                  
                                  await updateAppSettings(updatedSettings);
                                  toast.success("Configurações atualizadas com sucesso");
                                  console.log("Configurações atualizadas:", updatedSettings);
                                } catch (error) {
                                  console.error("Erro ao atualizar configurações:", error);
                                  toast.error("Erro ao atualizar configurações");
                                }
                              }}
                              className="gap-2 cursor-pointer"
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
                    <div className="overflow-x-auto">
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
                                    className="flex-grow sm:flex-grow-0 cursor-pointer"
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
                                    className="hover:bg-red-100 hover:text-red-700 hover:border-red-700 cursor-pointer flex-grow sm:flex-grow-0"
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
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer",
                            !actualBirthDate && "text-muted-foreground"
                          )}
                        >
                          {actualBirthDate ? (
                            format(actualBirthDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={actualBirthDate}
                          onSelect={(date) => setActualBirthDate(date || undefined)}
                          initialFocus
                          locale={ptBR}
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
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                {settings?.actualBirthDate && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveActualBirthDate}
                    className="cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover Data
                  </Button>
                )}
                <Button 
                  onClick={handleSetActualBirthDate} 
                  disabled={!actualBirthDate}
                  className="cursor-pointer"
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isGuessDialogOpen} onOpenChange={setIsGuessDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{selectedGuess ? "Editar Palpite" : "Novo Palpite"}</DialogTitle>
                <DialogDescription>
                  {selectedGuess ? (
                    `Edite o palpite de ${selectedGuess.userName}`
                  ) : (
                    `Adicione um novo palpite para o nascimento ${settings?.babyName ? `da ${settings.babyName}` : ''}.`
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Nome</Label>
                    <input 
                      type="text" 
                      id="userName" 
                      value={selectedGuess ? selectedGuess.userName : newGuess.userName} 
                      onChange={(e) => {
                        if (selectedGuess) {
                          setSelectedGuess({...selectedGuess, userName: e.target.value} as BirthGuess);
                        } else {
                          setNewGuess({...newGuess, userName: e.target.value});
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Nome do participante"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="guessDate">Data do palpite</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="guessDate"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer",
                            !selectedGuess?.guessDate && !newGuess.date && "text-muted-foreground"
                          )}
                        >
                          {selectedGuess?.guessDate ? (
                            format(new Date(selectedGuess.guessDate.seconds * 1000), "dd/MM/yyyy", { locale: ptBR })
                          ) : newGuess.date ? (
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
                          selected={selectedGuess?.guessDate ? 
                            new Date(selectedGuess.guessDate.seconds * 1000) : 
                            newGuess.date}
                          onSelect={(date) => {
                            if (selectedGuess) {
                              // Usamos o operador as para forçar o tipo
                              setSelectedGuess({
                                ...selectedGuess, 
                                guessDate: date ? Timestamp.fromDate(date) : selectedGuess.guessDate
                              } as BirthGuess);
                            } else {
                              setNewGuess({
                                ...newGuess,
                                date: date || undefined
                              });
                            }
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <Label htmlFor="comment">Comentário</Label>
                    <textarea 
                      id="comment" 
                      value={selectedGuess ? selectedGuess.comment || '' : newGuess.comment} 
                      onChange={(e) => {
                        if (selectedGuess) {
                          setSelectedGuess({...selectedGuess, comment: e.target.value} as BirthGuess);
                        } else {
                          setNewGuess({...newGuess, comment: e.target.value});
                        }
                      }}
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
                    setSelectedGuess(null);
                    setNewGuess({ userName: '', comment: '', date: undefined });
                  }}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={selectedGuess ? handleEditGuess : handleAddGuess}
                  disabled={selectedGuess ? 
                    !selectedGuess.userName || !selectedGuess.guessDate : 
                    !newGuess.userName || !newGuess.date}
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                >
                  {isCreatingGuess ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedGuess ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      {selectedGuess ? "Atualizar Palpite" : "Criar Palpite"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  className="h-20 cursor-pointer"
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
                  className="h-20 cursor-pointer"
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
                <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
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
                  className="h-20 cursor-pointer"
                  onClick={() => {
                    // Implementação atual para CSV
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
                  className="h-20 cursor-pointer"
                  onClick={() => {
                    // Implementação atual para JSON
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
                <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Diálogo para exclusão em massa */}
          <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Palpites em Massa</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja excluir {selectedGuesses.length} {selectedGuesses.length === 1 ? 'palpite selecionado' : 'palpites selecionados'}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                  onClick={async () => {
                    setIsDeletingMultiple(true);
                    try {
                      await deleteManyGuesses(selectedGuesses);
                      toast.success(`${selectedGuesses.length} ${selectedGuesses.length === 1 ? 'palpite excluído' : 'palpites excluídos'} com sucesso`);
                      // Atualizar a lista excluindo os palpites selecionados
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
                  {isDeletingMultiple ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Diálogo de progresso de importação */}
          <Dialog open={isImportingFile} onOpenChange={(open) => {
            // Apenas permitir fechar se a importação estiver completa
            if (!open && importProgress.completed) {
              setIsImportingFile(false);
            }
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importando Palpites</DialogTitle>
                <DialogDescription>
                  {importProgress.completed 
                    ? "Importação concluída!" 
                    : "Aguarde enquanto importamos os palpites..."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 py-4">
                {/* Barra de progresso */}
                <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ 
                      width: `${(importProgress.current / importProgress.total) * 100}%` 
                    }}
                  ></div>
                </div>
                
                {/* Detalhes do progresso */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>
                    {importProgress.current} de {importProgress.total} palpites
                  </span>
                  <span>
                    {((importProgress.current / importProgress.total) * 100).toFixed(0)}%
                  </span>
                </div>
                
                {/* Palpite atual */}
                {importProgress.currentName && !importProgress.completed && (
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-background/50">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Importando: <strong>{importProgress.currentName}</strong></span>
                  </div>
                )}
                
                {/* Estatísticas */}
                {(importProgress.success > 0 || importProgress.errors > 0) && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 p-2 bg-success/10 rounded-md">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm"><strong>{importProgress.success}</strong> importados</span>
                    </div>
                    
                    {importProgress.errors > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm"><strong>{importProgress.errors}</strong> falhas</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {importProgress.completed ? (
                  <Button 
                    onClick={() => setIsImportingFile(false)}
                    className="cursor-pointer"
                  >
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Concluir
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    disabled
                    className="cursor-wait"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
