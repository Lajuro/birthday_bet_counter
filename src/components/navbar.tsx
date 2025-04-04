'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Menu, X, LogOut, User, Settings, Home, Calendar, ShieldCheck } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getAppSettings } from '@/lib/firebase/firestore';
import { AppSettings } from '@/types';
import { DebugToggle } from '@/components/debug-toggle';
import { debug } from '@/lib/debug';

export function Navbar() {
  const { user, userProfile, refreshUserProfile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Efeito para verificar se o userProfile está atualizado
  useEffect(() => {
    if (user && !userProfile) {
      debug.log("ui", "Navbar: Usuário existe mas perfil não carregado, atualizando...");
      refreshUserProfile();
    } else if (user && userProfile) {
      debug.log("ui", "Navbar: Perfil do usuário carregado:", userProfile);
    }
  }, [user, userProfile, refreshUserProfile]);

  // Carregar configurações da aplicação
  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const settings = await getAppSettings();
        if (settings) {
          setAppSettings(settings);
        }
      } catch (error) {
        debug.error('app', 'Erro ao carregar configurações da aplicação:', error);
      }
    };
    
    loadAppSettings();
  }, []);

  // Adicionar log para debug
  debug.log("ui", "Navbar renderizada. É admin?", isAdmin, "UserProfile:", userProfile);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao fazer logout.';
      toast.error('Erro ao fazer logout', {
        description: errorMessage,
      });
    }
  };

  // Função para obter as iniciais do nome para o avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Obter a primeira parte do email antes do @
  const getEmailUsername = (email: string | null | undefined) => {
    if (!email) return 'user';
    return email.split('@')[0];
  };

  const displayName = user?.displayName || getEmailUsername(user?.email);
  const initials = getInitials(user?.displayName);

  return (
    <nav className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative mr-4">
                <Image 
                  src="/logo.svg" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                {appSettings?.babyName || 'Bebê'}
              </span>
              <span className="ml-1 text-lg font-semibold text-slate-700 dark:text-slate-300">Contador</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="flex items-center">
                <Link href="/guesses" className="mr-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Todos os Palpites
                  </Button>
                </Link>
                
                {/* Toggle de Debug */}
                <div className="mr-4">
                  <DebugToggle />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-10 relative hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md flex items-center gap-2 pl-2 pr-3 cursor-pointer data-[state=open]:bg-white dark:data-[state=open]:bg-slate-900 data-[state=open]:border-x data-[state=open]:border-t data-[state=open]:border-slate-200 dark:data-[state=open]:border-slate-800 data-[state=open]:shadow-sm data-[state=open]:hover:bg-white dark:data-[state=open]:hover:bg-slate-900 data-[state=open]:rounded-b-none data-[state=open]:rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-800">
                        <AvatarImage 
                          src={userProfile?.photoURL || ''} 
                          alt={userProfile?.displayName || 'Avatar'} 
                        />
                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm">
                          {userProfile?.displayName ? userProfile?.displayName[0]?.toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[120px] truncate text-slate-700 dark:text-slate-300 data-[state=open]:text-slate-900 dark:data-[state=open]:text-slate-100">
                        {userProfile?.displayName || 'Usuário'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden rounded-t-none rounded-b-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg mt-0 animate-dropdown-expand"
                    align="center"
                    alignOffset={0}
                    sideOffset={0}
                    style={{
                      transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)"
                    }}
                    avoidCollisions={false}
                  >
                    {/* Email e Badge de Admin */}
                    <div className="p-3 pt-1 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px] block">
                        {userProfile?.email || ''}
                      </span>
                      {isAdmin && (
                        <Badge className="w-fit mt-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 text-xs px-2">
                          Administrador
                        </Badge>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link href="/">
                        <DropdownMenuItem className="cursor-pointer flex items-center py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300">
                          <div className="flex items-center justify-center h-8 w-8">
                            <Home className="h-4 w-4" />
                          </div>
                          <span>Início</span>
                        </DropdownMenuItem>
                      </Link>
                      
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer flex items-center py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300">
                          <div className="flex items-center justify-center h-8 w-8">
                            <User className="h-4 w-4" />
                          </div>
                          <span>Meu Perfil</span>
                        </DropdownMenuItem>
                      </Link>
                      
                      {isAdmin && (
                        <Link href="/admin">
                          <DropdownMenuItem className="cursor-pointer relative flex items-center py-2 bg-indigo-50/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 group">
                            <div className="flex items-center justify-center h-8 w-8">
                              <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span>Administração</span>
                            <div className="ml-2 h-4 w-4 flex items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white dark:bg-indigo-400 dark:text-indigo-950">
                              <ShieldCheck className="h-2.5 w-2.5" />
                            </div>
                          </DropdownMenuItem>
                        </Link>
                      )}
                    </div>
                    
                    <div className="py-1 border-t border-slate-200 dark:border-slate-800">
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center justify-center h-8 w-8">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/admin/login">
                  <Button 
                    variant="ghost" 
                    className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/admin/signup">
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            {user && (
              <div className="flex items-center mr-2">
                <Avatar className="h-8 w-8 border border-indigo-200 dark:border-indigo-800 cursor-pointer">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="space-y-1 px-4 py-3">
            {/* Toggle de Debug (mobile) */}
            <div className="flex items-center px-3 py-2 mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <DebugToggle />
            </div>
            {user && (
              <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                <Avatar className="h-10 w-10 border border-indigo-200 dark:border-indigo-800">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{displayName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{user.email}</span>
                  {isAdmin && (
                    <Badge className="w-fit mt-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 text-xs px-2">
                      Administrador
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Início
              </div>
            </Link>
            <Link
              href="/guesses"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Todos os Palpites
              </div>
            </Link>
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </div>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Administração
                    </div>
                  </Link>
                )}
              </>
            )}
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/admin/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
