import { useState, useEffect } from "react";
import {
  getAppSettings,
  getClosestGuess,
  getNextGuesses,
  getAllGuesses,
} from "@/lib/firebase/firestore";
import { AppSettings, BirthGuess } from "@/types";
import { Timestamp } from "firebase/firestore";
import { debug } from "@/lib/debug";
import { toast } from "sonner";

// Interface para o resultado do getClosestGuess
export interface ClosestGuessResult {
  guess: BirthGuess | null;
  difference?: string;
  ranking?: number;
  sameDayGuesses?: BirthGuess[]; // Outros palpites para o mesmo dia
}

// Interface para erros do Firebase
interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

// Configurações padrão da aplicação caso ocorra erro
const defaultAppSettings: AppSettings = {
  babyName: "Chloe",
  expectedBirthDate: Timestamp.now(),
  actualBirthDate: undefined,
  lastMenstruationDate: undefined,
  showCountdown: true,
  allowGuesses: true,
  guessPrice: 10, // Preço padrão de cada palpite em reais
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

export const useBabyData = () => {
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);
  const [closestGuess, setClosestGuess] = useState<ClosestGuessResult | null>(
    null
  );
  const [nextGuesses, setNextGuesses] = useState<BirthGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalGuessCount, setTotalGuessCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar configurações do app
      const settings = await getAppSettings();
      if (settings) {
        setAppSettings(settings);
      }

      // Buscar palpite mais próximo
      const closest = await getClosestGuess();
      if (closest) {
        setClosestGuess(closest);
      }

      // Buscar próximos palpites
      const nextThreeGuesses = await getNextGuesses(3);
      if (Array.isArray(nextThreeGuesses)) {
        setNextGuesses(nextThreeGuesses);
      }

      // Buscar contagem total de palpites
      const allGuesses = await getAllGuesses();
      setTotalGuessCount(allGuesses.length);

      // Limpar qualquer erro anterior se tudo deu certo
      setError(null);
    } catch (error: unknown) {
      debug.error("app", "Erro ao carregar dados:", error);

      // Verificar se é um erro de permissão do Firebase
      const fbError = error as FirebaseError;
      if (fbError && fbError.code === "permission-denied") {
        setError("acesso_negado");
        toast.error("Erro de permissão", {
          description:
            "Você não tem permissão para acessar estes dados. Faça login para continuar.",
        });
      } else {
        setError("erro_geral");
        toast.error("Erro ao carregar dados", {
          description:
            "Não foi possível carregar as informações. Tente novamente mais tarde.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      // Buscar palpite mais próximo
      const closest = await getClosestGuess();
      if (closest) {
        setClosestGuess(closest);
      }

      // Buscar próximos palpites
      const nextThreeGuesses = await getNextGuesses(3);
      if (Array.isArray(nextThreeGuesses)) {
        setNextGuesses(nextThreeGuesses);
      }

      // Atualizar contagem total
      const allGuesses = await getAllGuesses();
      setTotalGuessCount(allGuesses.length);
    } catch (error) {
      debug.error("app", "Erro ao atualizar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Determinar se o bebê já nasceu
  const babyBorn =
    appSettings?.actualBirthDate !== undefined &&
    appSettings?.actualBirthDate !== null;

  // Determinar se palpites são permitidos
  const allowGuesses = !babyBorn && appSettings?.allowGuesses !== false;

  return {
    appSettings,
    closestGuess,
    nextGuesses,
    loading,
    error,
    totalGuessCount,
    refreshData,
    babyBorn,
    allowGuesses,
  };
};
