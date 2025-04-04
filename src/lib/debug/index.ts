/**
 * Sistema de debug centralizado para o Contador de Palpites
 * Permite ativar/desativar logs do console facilmente
 */

// Configuração padrão
let debugEnabled = false;

// Verificar se o debug está habilitado no localStorage (persistir a preferência do usuário)
if (typeof window !== 'undefined') {
  const storedDebugSetting = localStorage.getItem('debug_enabled');
  debugEnabled = storedDebugSetting === 'true';
}

// Categorias de debug para organizar os logs
export type DebugCategory = 
  | 'auth'     // Logs relacionados à autenticação
  | 'firestore' // Logs relacionados ao Firestore
  | 'ui'        // Logs relacionados à interface
  | 'app'       // Logs gerais da aplicação
  | 'admin'     // Logs administrativos
  | 'perf';     // Logs de performance

// Função que substitui console.log
export const debug = {
  // Log apenas para informação
  log: (category: DebugCategory, message: string, ...data: unknown[]) => {
    if (debugEnabled) {
      console.log(`[DEBUG:${category}] ${message}`, ...data);
    }
  },
  
  // Log para erros
  error: (category: DebugCategory, message: string, ...data: unknown[]) => {
    if (debugEnabled) {
      console.error(`[ERROR:${category}] ${message}`, ...data);
    }
  },
  
  // Log para warnings
  warn: (category: DebugCategory, message: string, ...data: unknown[]) => {
    if (debugEnabled) {
      console.warn(`[WARN:${category}] ${message}`, ...data);
    }
  },
  
  // Log para informações importantes
  info: (category: DebugCategory, message: string, ...data: unknown[]) => {
    if (debugEnabled) {
      console.info(`[INFO:${category}] ${message}`, ...data);
    }
  },
  
  // Para medição de performance
  time: (label: string) => {
    if (debugEnabled) {
      console.time(`[DEBUG:TIMER] ${label}`);
    }
  },
  
  // Finaliza a medição de performance
  timeEnd: (label: string) => {
    if (debugEnabled) {
      console.timeEnd(`[DEBUG:TIMER] ${label}`);
    }
  },
  
  // Tabelas para visualizar dados estruturados
  table: (data: unknown, columns?: string[]) => {
    if (debugEnabled) {
      console.table(data, columns);
    }
  }
};

// Funções para controlar o estado de debug
export const setDebugEnabled = (enabled: boolean) => {
  debugEnabled = enabled;
  
  // Persistir a configuração no localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('debug_enabled', String(enabled));
  }
  
  // Confirmar a mudança
  if (enabled) {
    console.info('[DEBUG] Debug mode ativado. Todos os logs serão exibidos.');
  } else {
    console.info('[DEBUG] Debug mode desativado. Os logs não serão mais exibidos.');
  }
  
  return enabled;
};

// Verificar se o debug está habilitado
export const isDebugEnabled = () => debugEnabled;

// Toggle para facilitar a mudança de estado
export const toggleDebug = () => setDebugEnabled(!debugEnabled);
