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
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Interface para os erros de autenticação
interface AuthErrorResponse {
  code: string;
  message: string;
}

// Interface para as respostas de autenticação
interface AuthResponse {
  user: User | null;
  error: AuthErrorResponse | null;
}

// Interface para dados adicionais do usuário
interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  isAdmin?: boolean;
  [key: string]: unknown; // Para propriedades dinâmicas adicionais
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o displayName
    await updateProfile(userCredential.user, { displayName });
    
    // Criar o documento do usuário
    await createUserDocument(userCredential.user, { displayName });
    
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

// Função para login com Google
export const loginWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Verificar se o usuário já existe no Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    // Se não existir, criar o documento do usuário
    if (!userDoc.exists()) {
      await createUserDocument(userCredential.user, {
        displayName: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        photoURL: userCredential.user.photoURL || ''
      });
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
  const usersSnapshot = await getDoc(doc(db, 'users', 'count'));
  return !usersSnapshot.exists();
};

// Criar documento do usuário no Firestore
export const createUserDocument = async (user: User, additionalData: UserData): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    
    // Verificar se é o primeiro usuário a se registrar
    const isFirstUser = await isFirstUserRegistration();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        isAdmin: isFirstUser, // O primeiro usuário é admin
        createdAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error: unknown) {
      console.error("Erro ao criar documento do usuário:", error);
    }
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
