import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  where, 
  serverTimestamp as fbServerTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './config';
import type { BirthGuess, UserProfile, AppSettings } from '@/types';
import { User } from 'firebase/auth';

// Re-exportar o serverTimestamp para uso em outros arquivos
export const serverTimestamp = fbServerTimestamp;

// GERENCIAMENTO DE PALPITES DE NASCIMENTO

// Obter todos os palpites
export const getAllGuesses = async (): Promise<BirthGuess[]> => {
  try {
    const guessesSnapshot = await getDocs(collection(db, 'guesses'));
    const guesses: BirthGuess[] = [];
    
    guessesSnapshot.forEach((doc) => {
      guesses.push({ id: doc.id, ...doc.data() } as BirthGuess);
    });
    
    return guesses;
  } catch (error) {
    console.error('Erro ao buscar palpites:', error);
    return [];
  }
};

// Obter palpite por ID
export const getGuessById = async (id: string): Promise<BirthGuess | null> => {
  try {
    const guessDoc = await getDoc(doc(db, 'guesses', id));
    
    if (guessDoc.exists()) {
      return { id: guessDoc.id, ...guessDoc.data() } as BirthGuess;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar palpite:', error);
    return null;
  }
};

// Obter palpites de um usuário
export const getUserGuesses = async (userId: string): Promise<BirthGuess[]> => {
  try {
    const q = query(collection(db, 'guesses'), where('userId', '==', userId));
    const guessesSnapshot = await getDocs(q);
    const guesses: BirthGuess[] = [];
    
    guessesSnapshot.forEach((doc) => {
      guesses.push({ id: doc.id, ...doc.data() } as BirthGuess);
    });
    
    return guesses;
  } catch (error) {
    console.error('Erro ao buscar palpites do usuário:', error);
    return [];
  }
};

// Criar novo palpite
export const createGuess = async (guess: Omit<BirthGuess, 'id' | 'createdAt' | 'updatedAt'>): Promise<BirthGuess | null> => {
  try {
    // Verificar se o usuário já possui um palpite
    const existingGuesses = await getUserGuesses(guess.userId);
    
    if (existingGuesses.length > 0) {
      throw new Error('Usuário já possui um palpite registrado');
    }
    
    const guessData = {
      ...guess,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'guesses'), guessData);
    
    return {
      id: docRef.id,
      ...guess,
      createdAt: guessData.createdAt as unknown as Timestamp,
      updatedAt: guessData.updatedAt as unknown as Timestamp
    };
  } catch (error) {
    console.error('Erro ao criar palpite:', error);
    return null;
  }
};

// Criar palpite em massa (permite múltiplos palpites do mesmo usuário)
export const createBulkGuess = async (guess: Omit<BirthGuess, 'id' | 'createdAt' | 'updatedAt'>): Promise<BirthGuess | null> => {
  try {
    const guessData = {
      ...guess,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'guesses'), guessData);
    
    return {
      id: docRef.id,
      ...guess,
      createdAt: guessData.createdAt as unknown as Timestamp,
      updatedAt: guessData.updatedAt as unknown as Timestamp
    };
  } catch (error) {
    console.error('Erro ao criar palpite em massa:', error);
    return null;
  }
};

// Atualizar palpite
export const updateGuess = async (id: string, data: Partial<BirthGuess>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'guesses', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar palpite:', error);
    return false;
  }
};

// Deletar palpite
export const deleteGuess = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'guesses', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar palpite:', error);
    return false;
  }
};

// Deletar múltiplos palpites
export const deleteManyGuesses = async (ids: string[]): Promise<{ success: number; failed: number }> => {
  try {
    const results = await Promise.allSettled(
      ids.map(id => deleteDoc(doc(db, 'guesses', id)))
    );
    
    const success = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return { success, failed };
  } catch (error) {
    console.error('Erro ao deletar múltiplos palpites:', error);
    return { success: 0, failed: ids.length };
  }
};

// Obter palpite mais próximo da data real ou esperada
export const getClosestGuess = async (): Promise<{ 
  guess: BirthGuess | null; 
  difference?: string;
  ranking?: number;
} | null> => {
  try {
    // Verificar se há uma data real de nascimento
    const settings = await getAppSettings();
    
    if (settings?.actualBirthDate) {
      // Se o bebê já nasceu, usamos o determineWinner para pegar o vencedor
      const winnerResult = await determineWinner();
      
      if (winnerResult) {
        return {
          guess: winnerResult.winner,
          difference: winnerResult.formattedDifference,
          ranking: 1
        };
      }
    } else {
      // Se não nasceu, pegamos o primeiro palpite em ordem cronológica
      const allGuesses = await getAllGuesses();
      
      if (allGuesses.length === 0) {
        return null;
      }
      
      // Ordenar os palpites por data (crescente)
      const sortedGuesses = allGuesses
        .filter(guess => guess.guessDate?.seconds) // Garantir que cada palpite tem uma data válida
        .sort((a, b) => {
          const dateA = new Date(a.guessDate.seconds * 1000);
          const dateB = new Date(b.guessDate.seconds * 1000);
          return dateA.getTime() - dateB.getTime(); // Ordenação crescente
        });
      
      // Retornar o primeiro palpite (mais próximo)
      if (sortedGuesses.length > 0) {
        return { 
          guess: sortedGuesses[0],
          ranking: 1
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter palpite mais próximo:', error);
    return null;
  }
};

// Obter os próximos N palpites mais próximos da data alvo
export const getNextGuesses = async (count: number = 3): Promise<BirthGuess[]> => {
  try {
    // Obter todos os palpites
    const guesses = await getAllGuesses();
    
    if (guesses.length <= 1) {
      return []; // Se há apenas um ou nenhum palpite, não há "próximos"
    }
    
    // Ordenar palpites por data (crescente)
    const sortedGuesses = guesses
      .filter(guess => guess.guessDate?.seconds) // Garantir que cada palpite tem uma data válida
      .sort((a, b) => {
        const dateA = new Date(a.guessDate.seconds * 1000);
        const dateB = new Date(b.guessDate.seconds * 1000);
        return dateA.getTime() - dateB.getTime(); // Ordenação crescente
      });
    
    // Pegar os próximos N palpites após o primeiro
    // Começamos do índice 1 para pular o primeiro palpite (que já é mostrado no destaque)
    return sortedGuesses.slice(1, count + 1);
  } catch (error) {
    console.error('Erro ao buscar próximos palpites:', error);
    return [];
  }
};

// GERENCIAMENTO DE CONFIGURAÇÕES DA APLICAÇÃO

// Obter configurações do app
export const getAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const settingsRef = doc(db, 'settings', 'app');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as AppSettings;
    }
    
    // Criar configurações padrão se não existirem
    const defaultSettings: AppSettings = {
      babyName: 'Chloe',
      expectedBirthDate: Timestamp.fromDate(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)), // Data atual + 30 dias como padrão
      actualBirthDate: undefined,
      showCountdown: true,
      allowGuesses: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Salvar as configurações padrão
    await setDoc(settingsRef, defaultSettings);
    console.log('Configurações padrão criadas com sucesso');
    
    return defaultSettings;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return null;
  }
};

// Atualizar configurações do app
export const updateAppSettings = async (settings: Partial<AppSettings>): Promise<boolean> => {
  try {
    const settingsRef = doc(db, 'settings', 'app');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(settingsRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return false;
  }
};

// GERENCIAMENTO DE USUÁRIOS

// Buscar perfil do usuário
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Buscando perfil do usuário:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      console.log('Perfil do usuário encontrado:', userData);
      
      // Se não tiver a propriedade isAdmin, verificamos se é o primeiro usuário
      if (userData.isAdmin === undefined) {
        console.log('Verificando se é o primeiro usuário para atribuir status de admin');
        const usersCollection = collection(db, 'users');
        const usersQuery = query(usersCollection, limit(2));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Se houver apenas um usuário (este), é o administrador
        if (usersSnapshot.size === 1) {
          console.log('É o único usuário, atualizando como admin');
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            isAdmin: true,
            status: 'approved'
          });
          
          return {
            ...userData,
            isAdmin: true,
            status: 'approved'
          } as UserProfile;
        }
      }
      
      return userData;
    }
    
    console.log('Perfil do usuário não encontrado');
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
};

// Obter todos os usuários
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const users: UserProfile[] = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      users.push({
        ...userData,
        uid: doc.id
      });
    });
    
    return users;
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return [];
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar perfil de usuário:', error);
    return false;
  }
};

// GERENCIAMENTO DE APROVAÇÃO DE USUÁRIOS

// Obter todos os usuários pendentes
export const getPendingUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const pendingUsersQuery = query(
      usersCollection, 
      where('status', '==', 'pending')
    );
    
    const pendingUsersSnapshot = await getDocs(pendingUsersQuery);
    
    const pendingUsers: UserProfile[] = [];
    pendingUsersSnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      pendingUsers.push({
        ...userData,
        uid: doc.id
      });
    });
    
    return pendingUsers;
  } catch (error) {
    console.error('Erro ao obter usuários pendentes:', error);
    return [];
  }
};

// Aprovar um usuário
export const approveUser = async (userId: string, adminId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isApproved: true,
      status: 'approved',
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    return false;
  }
};

// Rejeitar um usuário
export const rejectUser = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      isApproved: false,
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error);
    return false;
  }
};

// Atualizar o createUserProfile para iniciar com status pendente
export const createUserProfile = async (user: User, authProvider: string = 'google'): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const currentTimestamp = Timestamp.now();
    
    // Criar o perfil base do usuário
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: false,
      isApproved: false,
      status: 'pending',
      createdAt: currentTimestamp,
      lastLogin: currentTimestamp,
      authProvider
    };
    
    await setDoc(userRef, userProfile);
    
    return true;
  } catch (error) {
    console.error('Erro ao criar perfil de usuário:', error);
    return false;
  }
};

// DETERMINAÇÃO DO VENCEDOR

// Calcular a diferença em ms entre duas datas
const calculateTimeDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime());
};

// Interface para o resultado do vencedor
export interface WinnerResult {
  winner: BirthGuess;
  timeDifference: number; // diferença em milissegundos
  formattedDifference: string; // diferença formatada (ex: "2 dias, 5 horas")
  allGuessesWithDifference: Array<BirthGuess & { 
    timeDifference: number;
    formattedDifference: string;
    ranking: number;
  }>;
}

// Formatar a diferença de tempo
const formatTimeDifference = (diffMs: number): string => {
  // Converter para segundos, minutos, horas e dias
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Calcular os restos
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  
  // Construir a string de diferença
  const parts = [];
  if (days > 0) {
    parts.push(`${days} dia${days !== 1 ? 's' : ''}`);
  }
  if (remainingHours > 0) {
    parts.push(`${remainingHours} hora${remainingHours !== 1 ? 's' : ''}`);
  }
  if (remainingMinutes > 0 && days === 0) { // Só mostrar minutos se for menos de um dia
    parts.push(`${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

// Determinar o vencedor
export const determineWinner = async (): Promise<WinnerResult | null> => {
  try {
    // Obter as configurações do app e verificar se a data real já foi definida
    const appSettings = await getAppSettings();
    if (!appSettings?.actualBirthDate) {
      return null; // Não há data real definida ainda
    }
    
    // Obter todos os palpites
    const allGuesses = await getAllGuesses();
    if (allGuesses.length === 0) {
      return null; // Não há palpites para comparar
    }
    
    // Converter a data real para um objeto Date
    const actualBirthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
    
    // Calcular a diferença para cada palpite
    const guessesWithDifference = allGuesses.map(guess => {
      // Converter o palpite para um objeto Date
      const guessDate = new Date(guess.guessDate.seconds * 1000);
      
      // Calcular a diferença
      const timeDifference = calculateTimeDifference(actualBirthDate, guessDate);
      
      return {
        ...guess,
        timeDifference,
        formattedDifference: formatTimeDifference(timeDifference)
      };
    });
    
    // Ordenar por diferença (do menor para o maior)
    const sortedGuesses = [...guessesWithDifference].sort((a, b) => 
      a.timeDifference - b.timeDifference
    );
    
    // Adicionar informação de ranking
    const rankedGuesses = sortedGuesses.map((guess, index) => ({
      ...guess,
      ranking: index + 1
    }));
    
    // O vencedor é o primeiro da lista ordenada
    const winner = rankedGuesses[0];
    
    return {
      winner,
      timeDifference: winner.timeDifference,
      formattedDifference: winner.formattedDifference,
      allGuessesWithDifference: rankedGuesses
    };
  } catch (error) {
    console.error('Erro ao determinar vencedor:', error);
    return null;
  }
};
