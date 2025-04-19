import React from "react";
import { BirthGuess } from "@/types";
import { CountdownData } from "@/hooks/useTimeCalculations";

type GuessCardProps = {
  guess: BirthGuess;
  countdown: CountdownData | undefined;
  isMain?: boolean;
};

export const GuessCard: React.FC<GuessCardProps> = ({
  guess,
  countdown,
  isMain = false,
}) => {
  if (!countdown) return null;

  const subtitle = `Palpite: ${new Date(
    guess.guessDate.seconds * 1000
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;

  // Calcular dias totais (semanas * 7 + dias)
  const totalDays = countdown.weeks * 7 + countdown.days;

  // Definir estilos para o card de palpites
  const cardClasses = `rounded-lg border shadow-md transition-all duration-300 overflow-hidden h-full
                      ${
                        isMain
                          ? "border-indigo-300 dark:border-indigo-700 hover:shadow-xl hover:-translate-y-1"
                          : "border-indigo-200 dark:border-indigo-800/60"
                      }`;
  const titleColor = "text-indigo-600 dark:text-indigo-400";
  const subtitleColor = "text-slate-500 dark:text-slate-400";
  const numberColor = "text-indigo-600 dark:text-indigo-400";
  const labelColor = "text-slate-500 dark:text-slate-400";
  const pillColor =
    "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";

  // Definir tamanhos com base em se é um card principal ou secundário
  const headerPadding = isMain ? "p-3 sm:p-4" : "p-2";
  const contentPadding = isMain ? "p-3 sm:p-4" : "p-2";
  const numberSize = isMain ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";
  const titleSize = isMain ? "text-lg sm:text-xl" : "text-sm";
  const subtitleSize = isMain ? "text-sm" : "text-xs";
  const pillPadding = isMain ? "px-3 py-2" : "px-2 py-1.5";

  // Definir gradiente de fundo para o card principal (palpite mais próximo)
  const bgGradient = isMain
    ? "bg-gradient-to-br from-white to-indigo-50 dark:from-indigo-950/50 dark:to-indigo-950/50"
    : "bg-white dark:bg-slate-900";

  return (
    <div className={`${cardClasses} ${bgGradient}`}>
      {/* Cabeçalho do card */}
      <div
        className={`${headerPadding} border-b border-indigo-200 dark:border-indigo-800/60`}
      >
        <div className="flex flex-col">
          <h3
            className={`font-bold ${titleColor} ${titleSize} ${
              isMain ? "" : "truncate"
            }`}
          >
            {guess.userName}{" "}
            {isMain && (
              <span className="ml-1 text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">
                Mais próximo
              </span>
            )}
          </h3>
          <p className={`${subtitleSize} ${subtitleColor} mt-0.5`}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className={contentPadding}>
        {/* Contadores de tempo */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative`}
              >
                {totalDays}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Dias
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative`}
              >
                {countdown.hours}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Horas
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative`}
              >
                {countdown.minutes}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Min
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative ${
                  isMain ? "group-hover:animate-pulse" : ""
                }`}
              >
                {countdown.seconds}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Seg
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className={`${labelColor} font-semibold`}>Progresso</span>
            <span
              className={`${titleColor} bg-indigo-100/50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full font-semibold`}
            >
              {Math.round(countdown.progress)}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100/70 dark:bg-slate-800/70 rounded-full overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out relative"
              style={{ width: `${countdown.progress || 0}%` }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 dark:bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
