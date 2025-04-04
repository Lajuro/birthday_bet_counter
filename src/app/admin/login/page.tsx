"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { loginWithGoogle } from "@/lib/firebase/auth";
import { toast } from 'sonner';
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuth } from '@/contexts/auth-context';
import { debug } from '@/lib/debug';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email("Insira um endereço de email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

// Tipo do formulário de login
type LoginFormValues = z.infer<typeof loginSchema>;

// Define o schema para o formulário
const formSchema = loginSchema;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { refreshUserProfile, forceAdminStatus } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usando useEffect para redirecionar após a renderização, não durante
  useEffect(() => {
    // Verificar se o usuário já está logado
    const checkAuthState = () => {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          // Usuário já logado, redirecionar para a página inicial
          router.push("/");
        }
      });

      // Limpeza da inscrição quando o componente desmontar
      return () => unsubscribe();
    };

    checkAuthState();
  }, [router]);

  // Função para lidar com o submit do formulário
  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoggingIn(true);
      setError(null); // Limpa erros anteriores
      
      // Login com Firebase Authentication
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Redirecionar para a página inicial após o login bem-sucedido
      router.push("/");
    } catch (err: unknown) {
      debug.error('admin', 'Erro ao fazer login:', err);
      
      // Lidar com erros de autenticação
      let errorMessage = "Ocorreu um erro durante o login. Tente novamente.";
      
      if (err instanceof Error) {
        const firebaseError = err as FirebaseError;
        
        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Email ou senha inválidos. Verifique suas credenciais.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Muitas tentativas de login. Tente novamente mais tarde.";
            break;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Função para login com Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    try {
      const { user, error, isFirstUser } = await loginWithGoogle();
      if (error) {
        setError(error.message);
        toast.error('Erro no login', {
          description: error.message,
        });
      } else if (user) {
        toast.success('Login realizado com sucesso!');
        
        debug.log("auth", "É o primeiro usuário?", isFirstUser);
        
        // Esperar para garantir que o documento do usuário seja criado primeiro
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Se for o primeiro usuário, forçar status de admin no contexto
        if (isFirstUser) {
          debug.log("auth", "Forçando status de admin para o primeiro usuário");
          forceAdminStatus();
        }
        
        // Atualizar o perfil de qualquer forma
        await refreshUserProfile();
        
        // Verificar novamente o status e perfil
        const currentUserProfile = await getUserProfile(user.uid);
        debug.log("auth", "Perfil final antes do redirecionamento:", currentUserProfile);
        
        // Aguardar mais um momento para que a UI seja atualizada
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Redirecionar para a página principal
        debug.log("auth", "Redirecionando para a página principal...");
        router.push('/');
      }
    } catch (error) {
      debug.error('admin', 'Erro inesperado:', error);
      setError('Ocorreu um erro inesperado ao tentar fazer login.');
      toast.error('Erro no login', {
        description: 'Ocorreu um erro inesperado ao tentar fazer login.',
      });
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className="fixed inset-0 top-16 overflow-hidden flex flex-col items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <motion.div
          className="w-full max-w-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Card className="w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm bg-white dark:bg-slate-900 rounded-xl">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <CardHeader className="space-y-1 pb-2 pt-6 px-6">
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-center text-2xl font-semibold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Login
                  </CardTitle>
                  <CardDescription className="text-center text-slate-500 dark:text-slate-400 pt-1">
                    Entre com seu email e senha ou use sua conta Google
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 sm:px-8 pt-2 pb-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <motion.div variants={formItemVariants}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="seu@email.com" 
                                  type="email" 
                                  autoComplete="email" 
                                  className="transition-all duration-300 focus-visible:ring-indigo-400 focus-visible:border-indigo-500 h-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                      
                      <motion.div variants={formItemVariants} className="mt-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">Senha</FormLabel>
                                <Link href="#" className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                                  Esqueceu a senha?
                                </Link>
                              </div>
                              <FormControl>
                                <Input 
                                  placeholder="Sua senha" 
                                  type="password" 
                                  autoComplete="current-password" 
                                  className="transition-all duration-300 focus-visible:ring-indigo-400 focus-visible:border-indigo-500 h-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      variants={formItemVariants} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 h-11 rounded-lg font-medium" 
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                      OU CONTINUE COM
                    </span>
                  </div>
                </div>
                
                <motion.div
                  variants={formItemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button 
                    type="button" 
                    className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 shadow-sm transition-all duration-300 h-11 rounded-lg font-medium"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoggingIn}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                </motion.div>
              </CardContent>
              <CardFooter className="px-6 py-5 flex flex-col border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
                <div className="text-center">
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm"
                  >
                    <span className="text-slate-600 dark:text-slate-400">Não possui uma conta?</span>
                    <Link 
                      href="/admin/signup" 
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                      Cadastre-se agora →
                    </Link>
                  </motion.div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
        
        {error && (
          <motion.div
            className="mt-4 w-full max-w-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive" className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription className="mt-1">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </>
  );
}
