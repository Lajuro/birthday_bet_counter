import React from "react";
import { CountdownData, BabyAgeData } from "@/hooks/useTimeCalculations";
import { AppSettings } from "@/types";

type MainCountersProps = {
  expectedBirthCountdown: CountdownData | null;
  gestationalAge: BabyAgeData | null;
  settings: AppSettings;
};

export const MainCounters: React.FC<MainCountersProps> = ({
  expectedBirthCountdown,
  gestationalAge,
  settings,
}) => {
  // Formatar a data prevista para exibição
  const expectedDateFormatted = settings?.expectedBirthDate
    ? new Date(settings.expectedBirthDate.seconds * 1000).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "Não definida";

  // Formatar a data da DUM para exibição
  const dumDateFormatted = settings?.lastMenstruationDate
    ? new Date(settings.lastMenstruationDate.seconds * 1000).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
        }
      )
    : null;

  return (
    <div className="w-full mb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-screen-lg mx-auto">
          {/* Contador para Data Provável */}
          {expectedBirthCountdown && (
            <div className="h-full w-full">
              <div className="rounded-t-xl overflow-hidden shadow-md border border-indigo-200/30 dark:border-indigo-800/30 bg-white/5 dark:bg-indigo-900/10 backdrop-blur-sm">
                {/* Cabeçalho */}
                <div className="bg-indigo-600 text-center py-2 px-4">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Data Provável
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-0.5">
                    {expectedDateFormatted}
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="px-2 py-3 sm:px-4 sm:py-4">
                  <div className="flex justify-between gap-1 text-center">
                    {/* Semanas */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-indigo-400 text-base sm:text-lg">
                          {expectedBirthCountdown.weeks}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Sem
                        </div>
                      </div>
                    </div>

                    {/* Dias */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-indigo-400 text-base sm:text-lg">
                          {expectedBirthCountdown.days}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Dias
                        </div>
                      </div>
                    </div>

                    {/* Horas */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-indigo-400 text-base sm:text-lg">
                          {expectedBirthCountdown.hours}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Hrs
                        </div>
                      </div>
                    </div>

                    {/* Minutos */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-indigo-400 text-base sm:text-lg">
                          {expectedBirthCountdown.minutes}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Min
                        </div>
                      </div>
                    </div>

                    {/* Segundos */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-indigo-400 text-base sm:text-lg animate-pulse">
                          {expectedBirthCountdown.seconds}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Seg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-3 sm:mt-4">
                    <div className="h-1 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${expectedBirthCountdown.progress || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contador para Idade Gestacional */}
          {gestationalAge && settings?.lastMenstruationDate && (
            <div className="h-full w-full">
              <div className="rounded-t-xl overflow-hidden shadow-md border border-blue-200/30 dark:border-blue-800/30 bg-white/5 dark:bg-blue-900/10 backdrop-blur-sm">
                {/* Cabeçalho */}
                <div className="bg-blue-600 text-center py-2 px-4">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Idade Gestacional
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/80 mt-0.5">
                    DUM: {dumDateFormatted}
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="px-2 py-3 sm:px-4 sm:py-4">
                  <div className="flex justify-between gap-1 text-center">
                    {/* Semanas */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-blue-400 text-base sm:text-lg">
                          {gestationalAge.weeks}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Sem
                        </div>
                      </div>
                    </div>

                    {/* Dias */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-blue-400 text-base sm:text-lg">
                          {gestationalAge.days}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Dias
                        </div>
                      </div>
                    </div>

                    {/* Horas */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-blue-400 text-base sm:text-lg">
                          {gestationalAge.hours}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Hrs
                        </div>
                      </div>
                    </div>

                    {/* Minutos */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-blue-400 text-base sm:text-lg">
                          {gestationalAge.minutes}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Min
                        </div>
                      </div>
                    </div>

                    {/* Segundos */}
                    <div className="flex-1">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="font-bold text-blue-400 text-base sm:text-lg animate-pulse">
                          {gestationalAge.seconds}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">
                          Seg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-3 sm:mt-4">
                    <div className="h-1 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${gestationalAge.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
