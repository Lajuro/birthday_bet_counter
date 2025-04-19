import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timestamp } from "firebase/firestore";
import { BirthGuess } from "@/types";

interface CountdownProps {
  targetDate: Timestamp | Date;
  closestGuess?: BirthGuess | null;
  expectedDate?: Timestamp | Date;
  isActualDate?: boolean;
}

export function Countdown({
  targetDate,
  closestGuess,
  expectedDate,
  isActualDate = false,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [progress, setProgress] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target =
      targetDate instanceof Date
        ? targetDate
        : new Date(targetDate.seconds * 1000);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        return;
      }

      // Calcular o progresso baseado na data esperada e atual
      if (expectedDate) {
        const expected =
          expectedDate instanceof Date
            ? expectedDate
            : new Date(expectedDate.seconds * 1000);

        const totalDuration =
          expected.getTime() -
          new Date(expected.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
        const elapsed = expected.getTime() - now.getTime();
        const calculatedProgress = Math.min(
          100,
          Math.max(0, 100 - (elapsed / totalDuration) * 100)
        );

        setProgress(calculatedProgress);
      }

      // Calcular o tempo restante
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, expectedDate]);

  return (
    <Card className="w-full max-w-md bg-background/40 backdrop-blur-md border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          {isExpired
            ? isActualDate
              ? "Chloe já nasceu!"
              : "A data prevista chegou!"
            : "Contagem Regressiva"}
        </CardTitle>
        <CardDescription>
          {isActualDate
            ? "Data real de nascimento"
            : "Aguardando a chegada da Chloe"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isExpired ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{timeLeft.days}</span>
              <span className="text-xs text-muted-foreground">Dias</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{timeLeft.hours}</span>
              <span className="text-xs text-muted-foreground">Horas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{timeLeft.minutes}</span>
              <span className="text-xs text-muted-foreground">Minutos</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{timeLeft.seconds}</span>
              <span className="text-xs text-muted-foreground">Segundos</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-2xl font-bold text-primary">
              {isActualDate ? "Bem-vinda, Chloe!" : "Aguardando o grande dia"}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {closestGuess && (
          <div className="pt-4 text-center border-t border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Palpite mais próximo</span>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                {new Date(
                  closestGuess.guessDate.seconds * 1000
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}{" "}
                {new Date(
                  closestGuess.guessDate.seconds * 1000
                ).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {closestGuess.userName.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-sm">{closestGuess.userName}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center text-xs text-muted-foreground">
        {isExpired
          ? isActualDate
            ? "Chloe nasceu nesta data"
            : "Esta era a data prevista para o nascimento"
          : "Tempo restante até a data estimada"}
      </CardFooter>
    </Card>
  );
}
