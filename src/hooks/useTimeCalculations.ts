import { useState, useEffect } from "react";
import { AppSettings, BirthGuess } from "@/types";
import { debug } from "@/lib/debug";

// Interface para os countdowns calculados
export interface CountdownData {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

// Interface para o countup da idade do bebê
export interface BabyAgeData {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  progress?: number;
}

export const useTimeCalculations = (
  appSettings: AppSettings | null,
  closestGuess: BirthGuess | null,
  nextGuesses: BirthGuess[]
) => {
  const [countdowns, setCountdowns] = useState<{
    [key: string]: CountdownData;
  }>({});
  const [babyAge, setBabyAge] = useState<BabyAgeData | null>(null);
  const [gestationalAge, setGestationalAge] = useState<BabyAgeData | null>(
    null
  );
  const [expectedBirthCountdown, setExpectedBirthCountdown] =
    useState<CountdownData | null>(null);

  useEffect(() => {
    if (!appSettings) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns: { [key: string]: CountdownData } = {};

      // Verificar se temos a data da última menstruação com todas as propriedades necessárias
      const hasDUM =
        appSettings?.lastMenstruationDate !== undefined &&
        appSettings?.lastMenstruationDate !== null &&
        typeof appSettings?.lastMenstruationDate?.seconds === "number";

      // Só acessar a propriedade seconds se tivermos certeza que ela existe
      const dumDate =
        hasDUM && appSettings?.lastMenstruationDate?.seconds
          ? new Date(appSettings.lastMenstruationDate.seconds * 1000)
          : null;

      // Calcular countdown para a data esperada de nascimento
      if (
        appSettings.expectedBirthDate &&
        appSettings.expectedBirthDate.seconds &&
        !appSettings.actualBirthDate
      ) {
        const expectedDate = new Date(
          appSettings.expectedBirthDate.seconds * 1000
        );
        const difference = expectedDate.getTime() - now.getTime();

        if (difference <= 0) {
          setExpectedBirthCountdown({
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            progress: 100,
          });
        } else {
          // Calcular progresso - usando DUM como data inicial
          let progress = 0;

          if (hasDUM && dumDate) {
            // Usar a DUM real como data de início
            const totalDuration = expectedDate.getTime() - dumDate.getTime();
            const elapsed = now.getTime() - dumDate.getTime();
            progress = Math.min(
              100,
              Math.max(0, (elapsed / totalDuration) * 100)
            );
          } else {
            // Fallback para o método anterior caso não tenha DUM
            const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
            const startDate = new Date(
              expectedDate.getTime() - totalWaitDuration
            );
            const totalDuration = expectedDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            progress = Math.min(
              100,
              Math.max(0, (elapsed / totalDuration) * 100)
            );
          }

          // Calcular tempo restante
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setExpectedBirthCountdown({
            weeks,
            days,
            hours,
            minutes,
            seconds,
            progress,
          });
        }
      } else {
        setExpectedBirthCountdown(null);
      }

      // Calcular idade do bebê (countup) se já nasceu
      if (appSettings.actualBirthDate && appSettings.actualBirthDate.seconds) {
        const birthDate = new Date(appSettings.actualBirthDate.seconds * 1000);
        const difference = now.getTime() - birthDate.getTime();

        if (difference > 0) {
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setBabyAge({ weeks, days, hours, minutes, seconds, totalDays });
        }
      } else {
        setBabyAge(null);
      }

      // Calcular idade gestacional com base na DUM (lastMenstruationDate)
      if (hasDUM && dumDate) {
        const difference = now.getTime() - dumDate.getTime();

        if (difference > 0) {
          const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
          const weeks = Math.floor(totalDays / 7);
          const days = totalDays % 7;
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          // Calcular o progresso da idade gestacional usando a DUM até a data prevista
          let progress = 0;

          if (
            appSettings.expectedBirthDate &&
            appSettings.expectedBirthDate.seconds
          ) {
            const expectedDate = new Date(
              appSettings.expectedBirthDate.seconds * 1000
            );
            const totalDuration = expectedDate.getTime() - dumDate.getTime();
            progress = Math.min(
              100,
              Math.max(0, (difference / totalDuration) * 100)
            );
          } else {
            // Fallback para método anterior se não tiver data prevista
            const gestacaoCompleta = 40 * 7; // 40 semanas em dias
            progress = Math.min(100, (totalDays / gestacaoCompleta) * 100);
          }

          setGestationalAge({
            weeks,
            days,
            hours,
            minutes,
            seconds,
            totalDays,
            progress,
          });
        }
      } else {
        setGestationalAge(null);
      }

      // Calcular para o palpite mais próximo
      if (closestGuess) {
        try {
          const targetDate = new Date(closestGuess.guessDate.seconds * 1000);
          const difference = targetDate.getTime() - now.getTime();

          if (difference <= 0) {
            newCountdowns[closestGuess.id] = {
              weeks: 0,
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              progress: 100,
            };
          } else {
            // Calcular progresso usando a DUM como data inicial
            let progress = 0;

            if (hasDUM && dumDate) {
              // Usar a DUM real como data de início
              const totalDuration = targetDate.getTime() - dumDate.getTime();
              const elapsed = now.getTime() - dumDate.getTime();
              progress = Math.min(
                100,
                Math.max(0, (elapsed / totalDuration) * 100)
              );
            } else {
              // Fallback para o método anterior caso não tenha DUM
              const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
              const startDate = new Date(
                targetDate.getTime() - totalWaitDuration
              );
              const totalDuration = targetDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              progress = Math.min(
                100,
                Math.max(0, (elapsed / totalDuration) * 100)
              );
            }

            // Calcular tempo restante
            const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;
            const hours = Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (difference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            newCountdowns[closestGuess.id] = {
              weeks,
              days,
              hours,
              minutes,
              seconds,
              progress,
            };
          }
        } catch (error) {
          debug.error(
            "app",
            "Erro ao calcular countdown para palpite mais próximo:",
            error
          );
          newCountdowns[closestGuess.id] = {
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            progress: 0,
          };
        }
      }

      // Calcular para os próximos palpites
      nextGuesses.forEach((guess) => {
        try {
          if (!guess || !guess.guessDate || !guess.guessDate.seconds) {
            debug.warn("app", "Palpite com formato inválido:", guess);
            return;
          }

          const targetDate = new Date(guess.guessDate.seconds * 1000);
          const difference = targetDate.getTime() - now.getTime();

          if (difference <= 0) {
            newCountdowns[guess.id] = {
              weeks: 0,
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              progress: 100,
            };
          } else {
            // Calcular progresso usando a DUM como data inicial
            let progress = 0;

            if (hasDUM && dumDate) {
              // Usar a DUM real como data de início
              const totalDuration = targetDate.getTime() - dumDate.getTime();
              const elapsed = now.getTime() - dumDate.getTime();
              progress = Math.min(
                100,
                Math.max(0, (elapsed / totalDuration) * 100)
              );
            } else {
              // Fallback para o método anterior caso não tenha DUM
              const totalWaitDuration = 280 * 24 * 60 * 60 * 1000; // gestação média em ms
              const startDate = new Date(
                targetDate.getTime() - totalWaitDuration
              );
              const totalDuration = targetDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              progress = Math.min(
                100,
                Math.max(0, (elapsed / totalDuration) * 100)
              );
            }

            // Calcular tempo restante
            const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;
            const hours = Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (difference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            newCountdowns[guess.id] = {
              weeks,
              days,
              hours,
              minutes,
              seconds,
              progress,
            };
          }
        } catch (error) {
          debug.error(
            "app",
            "Erro ao calcular countdown para palpite:",
            guess.id,
            error
          );
          if (guess && guess.id) {
            newCountdowns[guess.id] = {
              weeks: 0,
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              progress: 0,
            };
          }
        }
      });

      setCountdowns(newCountdowns);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [appSettings, closestGuess, nextGuesses]);

  return {
    countdowns,
    babyAge,
    gestationalAge,
    expectedBirthCountdown,
  };
};
