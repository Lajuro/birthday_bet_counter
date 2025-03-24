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
  InfoIcon
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
      
      // Verificar se o usuário está autenticado com Google
      const providers = user.providerData || [];
      setIsGoogleUser(providers.some(provider => provider.providerId === "google.com"));
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
          <ReloadIcon className="h-12 w-12 animate-spin text-primary" />
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
    <div className="flex justify-center items-start w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl px-4 sm:px-6 py-10 md:py-16"
      >
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <User className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Meu Perfil
          </motion.h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Cartão da esquerda - Avatar e informações básicas */}
          <div className="lg:col-span-1">
            <MotionCard
              className="sticky top-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Minha Conta</span>
                </CardTitle>
                <CardDescription>Informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center px-4 sm:px-6 pb-6">
                <Avatar className="h-20 w-20 sm:h-28 sm:w-28 mb-5 border-4 border-primary/10 shadow-lg">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Avatar"} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {user?.displayName ? getInitials(user.displayName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <p className="font-medium text-lg mb-1">{user?.displayName || "Usuário"}</p>
                  <p className="text-muted-foreground text-sm mb-3 px-2">{user?.email}</p>
                  
                  <Badge variant={isGoogleUser ? "secondary" : "outline"} className="mb-2">
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
                  
                  <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center px-2">
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
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Gerenciar Conta</CardTitle>
              <CardDescription>Atualize suas informações pessoais e gerencie sua conta</CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 pb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="profile" className="flex-1 flex items-center justify-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Perfil</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="flex-1 flex items-center justify-center"
                    disabled={isGoogleUser}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>Segurança</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0 space-y-4">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="displayName" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Nome de Exibição</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="pl-10 pr-4 h-11 sm:h-12 text-base"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <User className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-1">
                          Este é o nome que será exibido para outros usuários
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="opacity-70 pl-10 pr-10 h-11 sm:h-12 text-base"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1 ml-1">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>O email não pode ser alterado</span>
                        </p>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="w-full sm:w-auto h-11 sm:h-12"
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
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Segurança da Conta</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Gerencie sua senha e proteja sua conta
                    </p>
                  </div>
                  
                  {!showPasswordForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                      className="mt-2 flex items-center h-11 sm:h-12"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span>Alterar Senha</span>
                    </Button>
                  ) : (
                    <motion.form 
                      onSubmit={handlePasswordChange} 
                      className="grid gap-5 bg-accent/30 p-4 rounded-lg border border-border/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="oldPassword" className="flex items-center gap-2">
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
                            className="pl-10 pr-4 h-11 sm:h-12 text-base"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="newPassword" className="flex items-center gap-2">
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
                            className="pl-10 pr-4 h-11 sm:h-12 text-base"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-1">
                          A senha deve ter pelo menos 6 caracteres
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
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
                            className="pl-10 pr-4 h-11 sm:h-12 text-base"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button 
                          type="submit" 
                          disabled={isUpdating}
                          className="sm:flex-1 h-11 sm:h-12"
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
                          className="sm:flex-1 h-11 sm:h-12"
                        >
                          <X className="mr-2 h-4 w-4" />
                          <span>Cancelar</span>
                        </Button>
                      </div>
                    </motion.form>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-muted/50 p-4 rounded-lg border border-border/50 mt-6">
                    <div className="flex items-start gap-3">
                      <InfoIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Dicas de Segurança</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-3">
                          <li>Use uma senha forte com pelo menos 8 caracteres</li>
                          <li>Combine letras maiúsculas, minúsculas, números e símbolos</li>
                          <li>Evite usar a mesma senha em sites diferentes</li>
                          <li>Não compartilhe sua senha com ninguém</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </MotionCard>
        </div>
      </motion.div>
    </div>
  );
}
