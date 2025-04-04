"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types';
import { debug } from '@/lib/debug';

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  isAdmin: boolean;
  refreshUserProfile: () => Promise<void>;
  forceAdminStatus: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userProfile: null,
  isLoading: true,
  isLoadingProfile: false,
  isAdmin: false,
  refreshUserProfile: async () => {},
  forceAdminStatus: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para forçar status de admin (usado após login do primeiro usuário)
  const forceAdminStatus = () => {
    debug.log("auth", "Forçando status de admin no contexto");
    setIsAdmin(true);
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        isAdmin: true
      });
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      setIsLoadingProfile(true);
      debug.log("auth", "AuthContext: Atualizando perfil do usuário:", user.uid);
      
      try {
        const profile = await getUserProfile(user.uid);
        debug.log("auth", "AuthContext: Perfil atualizado:", profile);
        
        if (profile) {
          setUserProfile(profile);
          setIsAdmin(!!profile.isAdmin);
          debug.log("auth", "AuthContext: Status de admin atualizado:", !!profile.isAdmin);
        } else {
          debug.log("auth", "AuthContext: Perfil não encontrado");
        }
      } catch (error) {
        debug.error('auth', 'Erro ao atualizar perfil:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      debug.log("auth", "AuthContext: Estado de autenticação alterado:", authUser?.uid);
      setUser(authUser);
      
      if (authUser) {
        setIsLoadingProfile(true);
        // Buscar perfil do usuário no Firestore
        try {
          const profile = await getUserProfile(authUser.uid);
          debug.log("auth", "AuthContext: Perfil carregado inicialmente:", profile);
          setUserProfile(profile);
          setIsAdmin(!!profile?.isAdmin);
        } catch (error) {
          debug.error('auth', 'Erro ao carregar perfil:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    isLoading,
    isLoadingProfile,
    isAdmin,
    refreshUserProfile,
    forceAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
