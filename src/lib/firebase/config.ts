import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase com variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verificação de configuração
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    'Variáveis de ambiente do Firebase não configuradas corretamente no arquivo .env.local. ' +
    'Verifique se você tem um arquivo .env.local com as seguintes variáveis:\n' +
    'NEXT_PUBLIC_FIREBASE_API_KEY\n' +
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\n' +
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID\n' +
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET\n' +
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\n' +
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  );
}

// Inicializar Firebase somente uma vez
let firebaseApp;
let firebaseAuth;
let firebaseDb;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
} else {
  firebaseApp = getApps()[0];
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
}

export const app = firebaseApp;
export const auth = firebaseAuth;
export const db = firebaseDb;
