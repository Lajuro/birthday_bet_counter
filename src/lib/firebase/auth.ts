import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './config';

// Interface para os erros de autenticação
export interface AuthErrorResponse {
  code: string;
  message: string;
}

// Interface para as respostas de autenticação
export interface AuthResponse {
  user: User | null;
  error: AuthErrorResponse | null;
  isFirstUser?: boolean;
}

// Interface para dados adicionais do usuário
export interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  isAdmin?: boolean;
  status?: 'approved' | 'pending';
  [key: string]: unknown; // Para propriedades dinâmicas adicionais
}

// Interface para dados de usuário pendente
export interface PendingUserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Função para login com email e senha
export const loginWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    return { 
      user: null, 
      error: {
        code: firebaseError.code,
        message: getAuthErrorMessage(firebaseError.code)
      } 
    };
  }
};

// Função para cadastro com email e senha
export const registerWithEmail = async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
  try {
    // Verificar se é o primeiro usuário
    const isFirstUser = await isFirstUserRegistration();
    
    // Criar o usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o displayName
    await updateProfile(userCredential.user, { displayName });
    
    try {
      // Para o primeiro usuário, criamos diretamente no Firestore (será admin)
      if (isFirstUser) {
        await createAdminUserDocument(userCredential.user, { 
          displayName,
          isAdmin: true,
          status: 'approved'
        });
      } else {
        // Para demais usuários, criamos um documento básico que está de acordo com as regras
        await createUserDocument(userCredential.user, { displayName });
        
        // Registramos separadamente em uma coleção pendingUsers para aprovação do admin
        await registerPendingUser(userCredential.user, { 
          displayName,
          email: userCredential.user.email || '',
          createdAt: new Date().toISOString()
        });
      }
    } catch (firestoreError) {
      console.error("Erro ao criar documento do usuário:", firestoreError);
      // Mesmo com erro no Firestore, o usuário foi criado no Authentication
    }
    
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    return { 
      user: null, 
      error: {
        code: firebaseError.code,
        message: getAuthErrorMessage(firebaseError.code)
      } 
    };
  }
};

// Criar documento para usuário admin (apenas para o primeiro usuário)
export const createAdminUserDocument = async (user: User, additionalData: UserData): Promise<void> => {
  if (!user) return;

  try {
    // Criar documento completo com privilégios admin
    const userRef = doc(db, 'users', user.uid);
    
    // Criar com todos os dados administrativos necessários
    await setDoc(userRef, {
      displayName: user.displayName || additionalData.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      isAdmin: true,
      status: 'approved',
      createdAt: serverTimestamp(),
      ...additionalData
    });
    
    // Criar documento de estatísticas do sistema
    const statsRef = doc(db, 'system', 'stats');
    await setDoc(statsRef, {
      totalUsers: 1,
      adminUsers: 1,
      firstUserCreatedAt: serverTimestamp()
    });
    
    console.log("Usuário admin criado com sucesso:", user.uid);
  } catch (error) {
    console.error("Erro ao criar documento do admin:", error);
    throw error;
  }
};

// Registrar usuário na coleção de aprovação pendente
export const registerPendingUser = async (user: User, userData: PendingUserData): Promise<void> => {
  if (!user) return;
  
  try {
    // Coleção separada para usuários pendentes
    const pendingRef = doc(db, 'pendingApprovals', user.uid);
    
    await setDoc(pendingRef, {
      ...userData,
      uid: user.uid,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    console.log("Usuário pendente registrado para aprovação:", user.uid);
  } catch (error) {
    console.error("Erro ao registrar usuário pendente:", error);
  }
};

// Criar documento básico do usuário no Firestore (seguindo as regras)
export const createUserDocument = async (user: User, additionalData: UserData): Promise<void> => {
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      // Dados básicos permitidos pelas regras (não inclui campos restritos)
      const basicUserData = {
        displayName: user.displayName || additionalData.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp()
      };
      
      // Não incluímos isAdmin ou status aqui para respeitar as regras
      console.log(`Criando usuário básico no Firestore: ${user.uid}`);
      await setDoc(userRef, basicUserData);
    }
  } catch (error) {
    console.error("Erro ao criar documento básico do usuário:", error);
    throw error;
  }
};

// Função para login com Google
export const loginWithGoogle = async (): Promise<AuthResponse> => {
  try {
    console.log("Iniciando login com Google...");
    
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    console.log("Autenticação com Google bem-sucedida:", userCredential.user.uid);
    
    // Verificar se o usuário já existe no Firestore
    try {
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      // Valor padrão para isFirstUser
      let isFirstUser = false;
      
      // Se não existir, criar o documento do usuário
      if (!userDoc.exists()) {
        console.log("Usuário não existe no Firestore, vamos criar:", userCredential.user.uid);
        
        // Verificar se é o primeiro usuário
        isFirstUser = await isFirstUserRegistration();
        console.log("É o primeiro usuário?", isFirstUser);
        
        // Preparar dados do usuário
        const userData: UserData = {
          displayName: userCredential.user.displayName || '',
          email: userCredential.user.email || '',
          photoURL: userCredential.user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Se for o primeiro usuário, é administrador e aprovado
          // Caso contrário, não é administrador e fica pendente de aprovação
          isAdmin: isFirstUser,
          status: isFirstUser ? 'approved' : 'pending',
        };
        
        console.log("Dados do usuário a serem criados:", userData);
        
        // Criar documento do usuário
        await setDoc(userRef, userData);
        console.log("Documento do usuário criado com sucesso.");
        
        // Se for o primeiro usuário, atualizar stats do sistema
        if (isFirstUser) {
          await updateSystemStats();
          console.log("Stats do sistema atualizados.");
        }
      } else {
        console.log("Usuário já existe no Firestore:", userCredential.user.uid);
        
        // Atualizar lastLogin
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });
        console.log("Último login atualizado.");
      }
      
      // Forçar uma atualização do perfil do usuário no context
      // Aguardar um curto período para garantir que os dados do Firestore estejam disponíveis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        user: userCredential.user,
        error: null,
        isFirstUser,
      };
    } catch (firestoreError) {
      console.error("Erro ao interagir com Firestore:", firestoreError);
      
      // Continuar com o login mesmo com erro no Firestore, mas reportar o erro
      return {
        user: userCredential.user,
        error: {
          code: 'firestore-error',
          message: 'Autenticação bem-sucedida, mas erro ao salvar dados: ' + 
            ((firestoreError as Error).message || 'Erro desconhecido'),
        },
        isFirstUser: false,
      };
    }
  } catch (error) {
    console.error("Erro no login com Google:", error);
    
    const firebaseError = error as FirebaseError;
    return {
      user: null,
      error: {
        code: firebaseError.code || 'unknown-error',
        message: firebaseError.message || 'Erro desconhecido no login com Google.',
      },
      isFirstUser: false,
    };
  }
};

// Função para recuperação de senha
export const resetPassword = async (email: string): Promise<{ success: boolean; error: AuthErrorResponse | null }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    return { 
      success: false, 
      error: {
        code: firebaseError.code,
        message: getAuthErrorMessage(firebaseError.code)
      } 
    };
  }
};

// Função para logout
export const signOut = async (): Promise<{ success: boolean; error: AuthErrorResponse | null }> => {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    return { 
      success: false, 
      error: {
        code: firebaseError.code,
        message: getAuthErrorMessage(firebaseError.code)
      } 
    };
  }
};

// Verificar se é o primeiro usuário a se registrar
export const isFirstUserRegistration = async (): Promise<boolean> => {
  try {
    console.log("Verificando se é o primeiro usuário...");
    
    // Método 1: Verificar documento de estatísticas
    const statsRef = doc(db, 'system', 'stats');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      console.log("Documento de estatísticas existe, não é o primeiro usuário");
      return false;
    }
    
    // Método 2: Verificar se a coleção users está vazia
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    
    const isEmpty = usersSnapshot.empty;
    console.log("Collection users está vazia?", isEmpty);
    
    return isEmpty;
  } catch (error) {
    console.error("Erro ao verificar se é o primeiro usuário:", error);
    // Em caso de erro, retorna false por segurança
    return false;
  }
};

// Função para atualizar o documento do usuário no Firestore
export const updateUserDocument = async (userId: string, data: UserData): Promise<void> => {
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error: unknown) {
    console.error("Erro ao atualizar documento do usuário:", error);
    throw error;
  }
};

// Interface para a resposta da alteração de senha
interface PasswordChangeResponse {
  success: boolean;
  error: AuthErrorResponse | null;
}

// Função para alteração de senha
export const changeUserPassword = async (email: string, oldPassword: string, newPassword: string): Promise<PasswordChangeResponse> => {
  try {
    if (!auth.currentUser || !email) {
      return {
        success: false,
        error: {
          code: 'auth/user-not-found',
          message: 'Usuário não encontrado.'
        }
      };
    }
    
    // Reautenticar o usuário
    const credential = EmailAuthProvider.credential(email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // Alterar a senha
    await updatePassword(auth.currentUser, newPassword);
    
    return { success: true, error: null };
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError;
    return { 
      success: false, 
      error: {
        code: firebaseError.code,
        message: getAuthErrorMessage(firebaseError.code)
      } 
    };
  }
};

// Função para obter mensagens de erro de autenticação em português
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/weak-password':
      return 'A senha é muito fraca.';
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/requires-recent-login':
      return 'Esta operação é sensível e requer autenticação recente.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelado pelo usuário.';
    default:
      return 'Ocorreu um erro na autenticação.';
  }
};

// Função para atualizar as estatísticas do sistema
export const updateSystemStats = async () => {
  try {
    const statsRef = doc(db, 'system', 'stats');
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const statsData = statsDoc.data();
      if (statsData) {
        await updateDoc(statsRef, {
          totalUsers: statsData.totalUsers + 1,
          adminUsers: statsData.adminUsers + 1,
        });
      }
    } else {
      await setDoc(statsRef, {
        totalUsers: 1,
        adminUsers: 1,
        firstUserCreatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar estatísticas do sistema:", error);
  }
};
