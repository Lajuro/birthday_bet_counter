"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { registerWithEmail } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

// Schema de validação para o formulário de cadastro
const signupFormSchema = z.object({
  displayName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

// Variantes para animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      duration: 0.3,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

const formItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Inicialização do formulário com react-hook-form e zod
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Função para cadastrar com email/senha
  const onSubmit = async (data: SignupFormValues) => {
    setIsCreatingAccount(true);
    setError(null);
    
    try {
      const result = await registerWithEmail(data.email, data.password, data.displayName);
      if (result.user) {
        // Ao invés de redirecionar, mostramos uma mensagem de sucesso
        setRegistrationSuccess(true);
        toast.success("Cadastro realizado com sucesso!");
        // Não redirecionamos o usuário, pois ele precisa aguardar aprovação
      } else {
        setError(result.error?.message || "Não foi possível criar sua conta.");
      }
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      setError(firebaseError.message || "Ocorreu um erro ao criar sua conta.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Se o usuário já estiver logado, redireciona para a página principal
  if (!isLoading && user) {
    router.push("/");
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body, html {
          overflow: hidden;
        }
      `}</style>
      <div className="fixed inset-0 top-16 overflow-hidden flex flex-col items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {registrationSuccess ? (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm bg-white dark:bg-slate-900 rounded-xl">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="space-y-1 pb-2 pt-6 px-6">
                <motion.div>
                  <CardTitle className="text-center text-2xl font-semibold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Cadastro Realizado!
                  </CardTitle>
                  <CardDescription className="text-center text-slate-500 dark:text-slate-400 pt-1">
                    Seu cadastro foi realizado com sucesso
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-3 px-6 sm:px-8 pt-2 pb-4">
                <Alert className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-slate-700 dark:text-slate-300 shadow-sm">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500 dark:text-amber-400" />
                  <AlertTitle className="text-sm font-medium">Aguardando Aprovação</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    Seu acesso está pendente de aprovação por um administrador. Você receberá uma notificação por email quando sua conta for aprovada.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => router.push("/admin/login")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 h-11 rounded-lg font-medium"
                  >
                    Voltar para o Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
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
                      Criar Conta
                    </CardTitle>
                    <CardDescription className="text-center text-slate-500 dark:text-slate-400 pt-1">
                      Preencha os campos abaixo para criar sua conta
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-3 px-6 sm:px-8 pt-2 pb-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={formItemVariants}>
                          <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">Nome completo</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Seu nome completo"
                                    className="transition-all duration-300 focus-visible:ring-indigo-400 focus-visible:border-indigo-500 h-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

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

                        <motion.div variants={formItemVariants}>
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">Senha</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Criar senha"
                                    type="password"
                                    autoComplete="new-password"
                                    className="transition-all duration-300 focus-visible:ring-indigo-400 focus-visible:border-indigo-500 h-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={formItemVariants}>
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm font-medium">Confirmar senha</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Confirmar senha"
                                    type="password"
                                    autoComplete="new-password"
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

                      <motion.div variants={formItemVariants} className="pt-2">
                        <Alert variant="default" className="border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-slate-700 dark:text-slate-300 shadow-sm">
                          <Info className="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <AlertTitle className="text-sm font-medium">Informação importante</AlertTitle>
                          <AlertDescription className="text-xs mt-1">
                            Ao criar uma conta, você concorda com nossos <Link href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">Termos de Serviço</Link> e <Link href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">Política de Privacidade</Link>.
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                      
                      <motion.div 
                        variants={formItemVariants} 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-2"
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 h-11 rounded-lg font-medium" 
                          disabled={isCreatingAccount}
                        >
                          {isCreatingAccount ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            "Criar Conta"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="px-6 py-5 flex flex-col border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
                  <div className="text-center">
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm"
                    >
                      <span className="text-slate-600 dark:text-slate-400">Já possui uma conta?</span>
                      <Link 
                        href="/admin/login" 
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                      >
                        Faça login agora →
                      </Link>
                    </motion.div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
        
        {error && !registrationSuccess && (
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
