"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import { updateUserDocument } from "@/lib/firebase/auth";
import { changeUserPassword } from "@/lib/firebase/auth";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  X, 
  Key, 
  AlertCircle,
  InfoIcon,
  ExternalLink,
  LockIcon
} from "lucide-react";

const MotionCard = motion(Card);

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      setDisplayName(user.displayName || "");
      
      // Verificar se é um usuário do Google
      const providerData = user.providerData;
      const isGoogle = providerData.some(provider => 
        provider.providerId === 'google.com'
      );
      setIsGoogleUser(isGoogle);
    }
  }, [user, isLoading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Atualizar displayName no Firebase Auth
      await updateProfile(user, { displayName });
      
      // Atualizar documento do usuário no Firestore
      await updateUserDocument(user.uid, { displayName });
      
      toast.success("Perfil atualizado com sucesso");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao atualizar seu perfil.";
      toast.error("Erro ao atualizar perfil", {
        description: errorMessage
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) return;
    
    // Validações básicas
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Usar a função implementada para alterar a senha
      const result = await changeUserPassword(user.email, oldPassword, newPassword);
      
      if (result.success) {
        toast.success("Senha alterada com sucesso");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        toast.error("Erro ao alterar senha", {
          description: result.error?.message || "Verifique se a senha atual está correta."
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Verifique se a senha atual está correta.";
      toast.error("Erro ao alterar senha", {
        description: errorMessage
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ReloadIcon className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        </motion.div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
    {/* Removendo barras de rolagem desnecessárias */}
    <div className="min-h-[calc(100vh-65px)] pb-6">
      <div className="container mx-auto py-4 px-4 h-full">
        <div className="flex justify-center items-start w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <User className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" />
              </motion.div>
              <motion.h1 
                className="text-2xl sm:text-3xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Meu Perfil
              </motion.h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 auto-rows-auto">
              {/* Cartão da esquerda - Avatar e informações básicas */}
              <div className="lg:col-span-2">
                <MotionCard
                  className="transform hover:-translate-y-1 transition-transform duration-300 border border-slate-800 bg-slate-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <CardHeader className="px-4 sm:px-6 border-b border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-purple-500">
                      <User className="h-4 w-4" />
                      <span>Minha Conta</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">Informações básicas</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center px-4 sm:px-6 pb-6 pt-4 bg-slate-900">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-5 border-4 border-slate-800 shadow-lg">
                      <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Avatar"} />
                      <AvatarFallback className="text-xl bg-slate-800 text-purple-500">
                        {user?.displayName ? getInitials(user.displayName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <p className="font-medium text-lg mb-1 text-white">{user?.displayName || "Usuário"}</p>
                      <p className="text-slate-400 text-sm mb-3 px-2 break-all">{user?.email}</p>
                      
                      <Badge variant={isGoogleUser ? "secondary" : "outline"} className="mb-2 bg-slate-800 text-white border-slate-700">
                        {isGoogleUser ? (
                          <div className="flex items-center space-x-1">
                            <span className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="h-3 w-3 rounded-full bg-yellow-500" />
                            <span className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="h-3 w-3 rounded-full bg-blue-500" />
                            <span className="ml-1">Conta Google</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Mail className="mr-1 h-3 w-3" />
                            <span>Email e Senha</span>
                          </div>
                        )}
                      </Badge>
                      
                      <div className="mt-4 text-xs text-slate-500 flex items-center justify-center px-2">
                        <InfoIcon className="h-3 w-3 flex-shrink-0 mr-1" />
                        <span>
                          {isGoogleUser
                            ? "Conta gerenciada pelo Google"
                            : "Conta local com email e senha"}
                        </span>
                      </div>
                    </motion.div>
                  </CardContent>
                </MotionCard>
              </div>
              
              {/* Lado direito - Formulários de edição */}
              <MotionCard 
                className="lg:col-span-3 transform hover:-translate-y-1 transition-transform duration-300 border border-slate-800 bg-slate-900"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CardHeader className="px-4 sm:px-6 border-b border-slate-800">
                  <CardTitle className="text-purple-500">Gerenciar Conta</CardTitle>
                  <CardDescription className="text-slate-400">Atualize suas informações pessoais e gerencie sua conta</CardDescription>
                </CardHeader>
                
                <CardContent className="px-4 sm:px-6 pb-6 pt-4 bg-slate-900">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full mb-6 bg-slate-800 flex overflow-x-auto">
                      <TabsTrigger 
                        value="profile" 
                        className="flex-1 flex items-center justify-center data-[state=active]:bg-slate-900 data-[state=active]:text-purple-500"
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Perfil</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className="flex-1 flex items-center justify-center data-[state=active]:bg-slate-900 data-[state=active]:text-purple-500"
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        <span>Segurança</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="mt-0 space-y-4">
                      <form onSubmit={handleProfileUpdate}>
                        <div className="grid gap-5">
                          <div className="grid gap-2">
                            <Label htmlFor="displayName" className="flex items-center gap-2 text-slate-300">
                              <User className="h-4 w-4" />
                              <span>Nome de Exibição</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="pl-10 pr-4 h-11 sm:h-12 text-base bg-slate-800 border-slate-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <User className="h-4 w-4" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 ml-1">
                              Este é o nome que será exibido para outros usuários
                            </p>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                              <Mail className="h-4 w-4" />
                              <span>Email</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="opacity-70 pl-10 pr-10 h-11 sm:h-12 text-base bg-slate-800 border-slate-700 text-white"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock className="h-4 w-4" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center mt-1 ml-1">
                              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>O email não pode ser alterado</span>
                            </p>
                          </div>
                          
                          <div className="flex justify-end mt-2">
                            <Button 
                              type="submit" 
                              disabled={isUpdating}
                              className="w-full sm:w-auto h-11 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {isUpdating ? (
                                <>
                                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Atualizando...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  <span>Salvar Alterações</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="security" className="mt-0 space-y-4">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-5 w-5 text-purple-500" />
                          <h3 className="text-lg font-medium text-white">Segurança da Conta</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Gerencie sua senha e proteja sua conta
                        </p>
                      </div>
                      
                      {isGoogleUser ? (
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-purple-900/50 rounded-xl p-4 sm:p-6 shadow-lg overflow-hidden relative">
                          {/* Elementos decorativos de fundo */}
                          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
                          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
                          
                          <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                            <div className="bg-amber-500/20 p-3 rounded-full shadow-inner flex-shrink-0">
                              <InfoIcon className="h-6 w-6 text-amber-300" />
                            </div>
                            
                            <div>
                              <h4 className="text-lg font-semibold text-amber-300 mb-3">
                                Conta gerenciada pelo Google
                              </h4>
                              
                              <p className="text-slate-300 leading-relaxed mb-4">
                                Você está usando uma conta do Google para acessar o sistema. Para mudar sua senha
                                ou configurações de segurança, você precisa gerenciá-las diretamente na sua conta 
                                Google.
                              </p>
                              
                              <Button 
                                variant="outline" 
                                className="group flex items-center bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 
                                hover:to-amber-600/30 border-amber-500/30 text-amber-300 hover:text-amber-200 
                                transition-all duration-300 shadow-sm hover:shadow-[0_0_10px_3px_rgba(245,158,11,0.2)]"
                                onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                <span>Gerenciar Conta Google</span>
                              </Button>
                              
                              {/* Badge decorativo */}
                              <div className="hidden sm:block absolute bottom-3 right-3 opacity-80">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <LockIcon className="h-3 w-3" />
                                  <span>Segurança Google</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!showPasswordForm ? (
                            <Button
                              variant="outline"
                              onClick={() => setShowPasswordForm(true)}
                              className="mt-2 flex items-center h-11 sm:h-12 border-slate-700 text-white hover:bg-slate-800"
                            >
                              <Key className="mr-2 h-4 w-4" />
                              <span>Alterar Senha</span>
                            </Button>
                          ) : (
                            <motion.form 
                              onSubmit={handlePasswordChange} 
                              className="grid gap-5 bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="grid gap-2">
                                <Label htmlFor="oldPassword" className="flex items-center gap-2 text-slate-300">
                                  <Key className="h-4 w-4" />
                                  <span>Senha Atual</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="oldPassword"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-4 h-11 sm:h-12 text-base bg-slate-800 border-slate-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="newPassword" className="flex items-center gap-2 text-slate-300">
                                  <Key className="h-4 w-4" />
                                  <span>Nova Senha</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                    className="pl-10 pr-4 h-11 sm:h-12 text-base bg-slate-800 border-slate-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 ml-1">
                                  A senha deve ter pelo menos 6 caracteres
                                </p>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-slate-300">
                                  <ShieldCheck className="h-4 w-4" />
                                  <span>Confirmar Nova Senha</span>
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    required
                                    className="pl-10 pr-4 h-11 sm:h-12 text-base bg-slate-800 border-slate-700 focus:ring-purple-500 focus:border-purple-500 text-white"
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <Button 
                                  type="submit" 
                                  disabled={isUpdating}
                                  className="sm:flex-1 h-11 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white order-2 sm:order-1"
                                >
                                  {isUpdating ? (
                                    <>
                                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                      <span>Alterando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      <span>Alterar Senha</span>
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setShowPasswordForm(false)}
                                  className="sm:flex-1 h-11 sm:h-12 border-slate-700 text-white hover:bg-slate-800 order-1 sm:order-2"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  <span>Cancelar</span>
                                </Button>
                              </div>
                            </motion.form>
                          )}
                          
                          <Separator className="my-6" />
                          
                          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm mt-6">
                            <div className="flex items-start gap-3">
                              <InfoIcon className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-sm mb-1 text-slate-300">Dicas de Segurança</h4>
                                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-3">
                                  <li>Use uma senha forte com pelo menos 8 caracteres</li>
                                  <li>Combine letras maiúsculas, minúsculas, números e símbolos</li>
                                  <li>Evite usar a mesma senha em sites diferentes</li>
                                  <li>Não compartilhe sua senha com ninguém</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </MotionCard>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
