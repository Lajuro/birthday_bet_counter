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

export function Navbar() {
  const { user, userProfile, refreshUserProfile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Verificar se o bebê já nasceu
  const babyBorn = appSettings?.actualBirthDate && appSettings.actualBirthDate.seconds;

  // Efeito para verificar se o userProfile está atualizado
  useEffect(() => {
    if (user && !userProfile) {
      refreshUserProfile();
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
        console.error('Erro ao carregar configurações da aplicação:', error);
      }
    };
    
    loadAppSettings();
  }, []);

  // Fechar menu mobile quando a rota muda
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  // Fechar menu mobile quando usuário pressiona ESC e controlar scroll do body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Controlar scroll do body quando menu mobile estiver aberto
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

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
    <nav className={`${babyBorn 
      ? 'bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-indigo-50/80 dark:from-pink-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 border-b border-pink-200/30 dark:border-pink-800/20 backdrop-blur-md' 
      : 'bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800'} 
      sticky top-0 z-50 shadow-sm transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between ${babyBorn ? 'h-12' : 'h-16'} transition-all duration-300`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative mr-3">
                <Image 
                  src="/logo.svg" 
                  alt="Logo" 
                  width={babyBorn ? 24 : 32} 
                  height={babyBorn ? 24 : 32} 
                  className="object-contain transition-all duration-300"
                />
              </div>
              <span className={`${babyBorn ? 'text-base' : 'text-xl'} font-bold ${babyBorn ? 'text-pink-700 dark:text-pink-400' : 'text-indigo-700 dark:text-indigo-400'} transition-all duration-300`}>
                {appSettings?.babyName || 'Bebê'}
              </span>
              <span className={`ml-1 ${babyBorn ? 'text-sm' : 'text-lg'} font-semibold ${babyBorn ? 'text-pink-600 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'} transition-all duration-300`}>
                {babyBorn ? '' : 'Contador'}
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="flex items-center">
                {!babyBorn && (
                  <Link href="/guesses" className="mr-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300 cursor-pointer"
                    >
                      Todos os Palpites
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={`p-0 h-10 relative rounded-md flex items-center gap-2 pl-2 pr-3 cursor-pointer focus:outline-none focus-visible:ring-2 ${
                        babyBorn 
                          ? 'hover:bg-pink-50 dark:hover:bg-pink-900/20 focus-visible:ring-pink-500 data-[state=open]:bg-pink-50/80 dark:data-[state=open]:bg-pink-900/30'
                          : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus-visible:ring-indigo-500 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-900'
                      } data-[state=open]:border-x data-[state=open]:border-t data-[state=open]:border-slate-200 dark:data-[state=open]:border-slate-800 data-[state=open]:shadow-sm data-[state=open]:rounded-b-none data-[state=open]:rounded-t-md`}
                    >
                      <Avatar className={`h-8 w-8 border ${babyBorn ? 'border-pink-200 dark:border-pink-800' : 'border-indigo-200 dark:border-indigo-800'}`}>
                        <AvatarImage 
                          src={userProfile?.photoURL || ''} 
                          alt={userProfile?.displayName || 'Avatar'} 
                        />
                        <AvatarFallback className={`text-sm ${babyBorn ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}`}>
                          {userProfile?.displayName ? userProfile?.displayName[0]?.toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`text-sm font-medium max-w-[120px] truncate ${babyBorn ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'} data-[state=open]:text-slate-900 dark:data-[state=open]:text-slate-100`}>
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
                <Avatar className={`h-8 w-8 border cursor-pointer ${babyBorn ? 'border-pink-200 dark:border-pink-800' : 'border-indigo-200 dark:border-indigo-800'}`}>
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                  ) : (
                    <AvatarFallback className={`text-sm ${babyBorn ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}`}>
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
              className={`mobile-menu-button navbar-transition ${babyBorn ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-900/20 dark:hover:text-pink-300' : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300'}`}
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

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="mobile-menu-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu content */}
          <div className={`mobile-menu-content fixed top-16 left-0 right-0 z-50 md:hidden border-t shadow-xl ${
            babyBorn 
              ? 'border-pink-200/30 dark:border-pink-800/20 bg-pink-50/95 dark:bg-pink-950/95' 
              : 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95'
          } backdrop-blur-lg`}>
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="space-y-1 px-4 py-4">
                {user && (
                  <div className={`flex items-center space-x-3 px-3 py-3 mb-3 rounded-lg border ${
                    babyBorn 
                      ? 'bg-pink-100/50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <Avatar className={`h-10 w-10 border-2 ${babyBorn ? 'border-pink-200 dark:border-pink-700' : 'border-indigo-200 dark:border-indigo-700'}`}>
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                      ) : (
                        <AvatarFallback className={`${babyBorn ? 'bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200' : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200'}`}>
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`font-medium text-sm truncate ${babyBorn ? 'text-pink-900 dark:text-pink-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        {displayName}
                      </span>
                      <span className={`text-xs truncate ${babyBorn ? 'text-pink-600 dark:text-pink-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {user.email}
                      </span>
                      {isAdmin && (
                        <Badge className={`w-fit mt-1 text-xs px-2 py-0.5 ${
                          babyBorn 
                            ? 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700' 
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700'
                        }`}>
                          Administrador
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <Link
                  href="/"
                  className={`mobile-menu-item flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    babyBorn 
                      ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Início
                </Link>
                
                {!babyBorn && (
                  <Link
                    href="/guesses"
                    className={`mobile-menu-item flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      babyBorn 
                        ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    Todos os Palpites
                  </Link>
                )}
                
                {user && (
                  <>
                    <Link
                      href="/profile"
                      className={`mobile-menu-item flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        babyBorn 
                          ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Meu Perfil
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`mobile-menu-item flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                          babyBorn 
                            ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        Administração
                        <ShieldCheck className="h-4 w-4 ml-auto" />
                      </Link>
                    )}
                    
                    <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                    
                    <Button
                      variant="ghost"
                      className="mobile-menu-item w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 px-3 py-3 h-auto"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sair
                    </Button>
                  </>
                )}
                
                {!user && (
                  <div className="space-y-2 pt-2">
                    <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-center h-12 ${
                          babyBorn 
                            ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        }`}
                      >
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/admin/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
                      >
                        Cadastrar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
