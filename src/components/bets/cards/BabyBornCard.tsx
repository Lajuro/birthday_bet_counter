import React from "react";
import { BirthGuess, AppSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BabyAgeData } from "@/hooks/useTimeCalculations";
import { TimeDisplay } from "@/components/bets/counters/TimeDisplay";

type BabyBornCardProps = {
  settings: AppSettings;
  babyAge: BabyAgeData | null;
  winningGuess: {
    guess: BirthGuess | null;
    difference?: string;
  } | null;
};

export const BabyBornCard: React.FC<BabyBornCardProps> = ({
  settings,
  babyAge,
  winningGuess,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Card className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 shadow-lg border-indigo-200 dark:border-indigo-800">
        <CardHeader className="py-4 px-6">
          <CardTitle className="text-2xl text-center text-indigo-700 dark:text-indigo-400">
            {settings?.babyName || "Bebê"} já nasceu!
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6 px-6">
          <div className="space-y-6">
            <p className="text-center font-medium text-base text-slate-700 dark:text-slate-300">
              Data de nascimento:{" "}
              {settings?.actualBirthDate && settings.actualBirthDate.seconds
                ? new Date(
                    settings.actualBirthDate.seconds * 1000
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Data não definida"}
            </p>

            {/* Countup da idade do bebê */}
            {babyAge && (
              <div className="mt-6">
                <TimeDisplay
                  data={babyAge}
                  title={`Idade da ${settings?.babyName || "Bebê"}`}
                  isMain={true}
                  type="gestational"
                />
              </div>
            )}

            {winningGuess?.guess && (
              <div className="mt-6 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-center font-bold text-indigo-600 dark:text-indigo-400 text-xl mb-3">
                  Ganhador do palpite
                </h3>
                <p className="text-center font-bold text-2xl text-slate-900 dark:text-white">
                  {winningGuess.guess.userName}
                </p>
                <p className="text-center text-slate-600 dark:text-slate-400 text-base mt-2">
                  Palpitou:{" "}
                  {winningGuess.guess.guessDate &&
                  winningGuess.guess.guessDate.seconds
                    ? new Date(
                        winningGuess.guess.guessDate.seconds * 1000
                      ).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </p>
                {winningGuess.difference && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                      Diferença: {winningGuess.difference}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
