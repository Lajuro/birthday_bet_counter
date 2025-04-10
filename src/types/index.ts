import { Timestamp } from 'firebase/firestore';

// Tipo para palpite de nascimento
export interface BirthGuess {
  id: string;
  userId: string;
  userName: string;
  guessDate: Timestamp;
  weight?: number;
  height?: number;
  comment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipo para perfil de usuário
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  isApproved: boolean;  // Indica se o usuário foi aprovado
  approvedBy?: string;  // ID do admin que aprovou o usuário
  approvedAt?: Timestamp; // Data da aprovação
  status: 'pending' | 'approved' | 'rejected'; // Status do usuário
  createdAt: Timestamp;
  lastLogin: Timestamp;
  updatedAt?: Timestamp;
  authProvider: string;
}

// Tipo para configurações da aplicação
export interface AppSettings {
  babyName: string;
  expectedBirthDate: Timestamp;
  actualBirthDate?: Timestamp;
  lastMenstruationDate?: Timestamp; // Data da Última Menstruação (DUM) ou último ultrassom
  showCountdown: boolean;
  allowGuesses: boolean;
  guessPrice: number; // Preço de cada palpite em reais
  pixKey?: string; // Chave PIX para pagamentos
  pixKeyType?: 'celular' | 'cpf' | 'email' | 'aleatoria'; // Tipo da chave PIX
  pixName?: string; // Nome da pessoa que receberá o PIX
  pixBank?: string; // Banco da conta PIX
  contactPhone?: string; // Telefone para contato (WhatsApp)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
