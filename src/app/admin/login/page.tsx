"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Variantes para animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
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

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // Usando useEffect para redirecionar após a renderização, não durante
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  // Inicialização do formulário com react-hook-form e zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Função para fazer login com email/senha
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    
    try {
      const result = await loginWithEmail(data.email, data.password);
      
      if (result.user) {
        toast.success("Login realizado com sucesso!");
        router.push("/");
      } else {
        toast.error("Falha no login", {
          description: result.error?.message || "Credenciais inválidas, tente novamente."
        });
      }
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      toast.error("Erro no login", {
        description: firebaseError.message || "Ocorreu um erro ao fazer login."
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Função para fazer login com Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (result.user) {
        toast.success("Login com Google realizado com sucesso!");
        router.push("/");
      } else {
        toast.error("Falha no login com Google", {
          description: result.error?.message
        });
      }
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      toast.error("Erro no login com Google", {
        description: firebaseError.message
      });
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ReloadIcon className="h-16 w-16 animate-spin text-primary" />
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
      <div className="fixed inset-0 top-16 overflow-hidden flex flex-col items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-background to-secondary/5">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Card className="w-full overflow-hidden border-primary/10 shadow-lg backdrop-blur-sm bg-card/95">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
                className="h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80"
              />
              <CardHeader className="space-y-1 text-center py-4">
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Login</CardTitle>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CardDescription className="text-muted-foreground text-sm">
                    Entre com seu email e senha ou use sua conta Google
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pt-0 pb-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <motion.div variants={formItemVariants}>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-foreground/80 text-sm">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="seu@email.com" 
                                type="email" 
                                autoComplete="email" 
                                className="transition-all duration-300 focus-visible:ring-primary/60 focus-visible:border-primary/80 h-9" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-foreground/80 text-sm">Senha</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Sua senha" 
                                type="password" 
                                autoComplete="current-password" 
                                className="transition-all duration-300 focus-visible:ring-primary/60 focus-visible:border-primary/80 h-9" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div 
                      variants={formItemVariants} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 shadow-md transition-all duration-300 h-9" 
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <>
                            <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
                
                <motion.div variants={itemVariants} className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full border-muted/50 shadow-sm hover:bg-secondary/30 transition-all duration-300 h-9 text-sm" 
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoggingIn}
                  >
                    {isGoogleLoggingIn ? (
                      <>
                        <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-3 w-3" viewBox="0 0 24 24">
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
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 border-t border-muted/30 pt-3 pb-4">
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="text-xs text-center"
                >
                  Não possui uma conta?{" "}
                  <Link href="/admin/signup" className="text-primary font-medium hover:underline transition-all">
                    Cadastre-se
                  </Link>
                </motion.div>
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -2 }} 
                  className="text-xs text-center"
                >
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-all">
                    Voltar para a página inicial
                  </Link>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
