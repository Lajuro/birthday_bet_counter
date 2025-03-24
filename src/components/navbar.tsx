'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Menu, X, LogOut, User, Settings, Home } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Chloe</span>
              <span className="ml-1 text-lg font-semibold">Countdown</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-10 relative hover:bg-accent rounded-full flex items-center gap-2 pl-2 pr-3 cursor-pointer">
                      <Avatar className="h-8 w-8 border border-primary/20 cursor-pointer">
                        {user.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {displayName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col space-y-1">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      {userProfile?.isAdmin && (
                        <Badge variant="outline" className="w-fit mt-1 bg-primary/5 text-primary border-primary/20 text-xs px-2">
                          Administrador
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/">
                      <DropdownMenuItem className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Início</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </DropdownMenuItem>
                    </Link>
                    {userProfile?.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Administração</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/admin/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/admin/signup">
                  <Button variant="default" size="sm">
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
                <Avatar className="h-8 w-8 border border-primary/20 cursor-pointer">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
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
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="space-y-1 px-4 py-3">
            {user && (
              <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                <Avatar className="h-10 w-10 border border-primary/20">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={displayName || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
                  {userProfile?.isAdmin && (
                    <Badge variant="outline" className="w-fit mt-1 bg-primary/5 text-primary border-primary/20 text-xs px-2">
                      Administrador
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Início
              </div>
            </Link>
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </div>
                </Link>
                {userProfile?.isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
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
                className="w-full justify-start"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/admin/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
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
