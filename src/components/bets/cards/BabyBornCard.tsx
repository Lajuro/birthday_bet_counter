import React from "react";
import { AppSettings } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BabyAgeData } from "@/hooks/useTimeCalculations";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Heart } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import "./baby-born-enhanced.css";

type BabyBornCardProps = {
  settings: AppSettings;
  babyAge: BabyAgeData | null;
};

export const BabyBornCard: React.FC<BabyBornCardProps> = ({
  settings,
  babyAge,
}) => {
  // Calcular anos, meses e dias detalhados
  const calculateDetailedAge = (babyAge: BabyAgeData) => {
    const totalDays = babyAge.totalDays;
    const years = Math.floor(totalDays / 365.25);
    const remainingDaysAfterYears = Math.floor(totalDays - years * 365.25);
    const months = Math.floor(remainingDaysAfterYears / 30.44);
    const days = Math.floor(remainingDaysAfterYears - months * 30.44);

    return { years, months, days };
  };

  const formatBirthDate = (date: Timestamp | undefined) => {
    if (!date?.seconds) return "Data não definida";

    return new Date(date.seconds * 1000).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatBirthTime = (date: Timestamp | undefined) => {
    if (!date?.seconds) return "";

    return new Date(date.seconds * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const detailedAge = babyAge ? calculateDetailedAge(babyAge) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      {/* Header Principal */}
      <Card className="baby-born-card w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 shadow-2xl border-pink-200/50 dark:border-pink-800/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-purple-100/10 to-indigo-100/20 dark:from-pink-900/10 dark:via-purple-900/5 dark:to-indigo-900/10"></div>

        <CardHeader className="relative text-center py-4 sm:py-6 px-3 sm:px-4 lg:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="baby-born-heart p-2 sm:p-3 md:p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-lg baby-born-glow">
              <Heart
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white"
                fill="currentColor"
              />
            </div>
          </div>

          <h1 className="baby-born-rainbow text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 leading-tight px-2">
            {settings?.babyName || "Bebê"} já nasceu! 🎉
          </h1>

          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">
                {formatBirthDate(settings?.actualBirthDate)}
              </span>
            </div>

            {formatBirthTime(settings?.actualBirthDate) && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">
                  às {formatBirthTime(settings?.actualBirthDate)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative pb-4 sm:pb-6 px-3 sm:px-4 lg:px-6">
          {babyAge && detailedAge && (
            <div className="space-y-4 sm:space-y-6">
              {/* Idade Detalhada */}
              {(detailedAge.years > 0 || detailedAge.months > 0) && (
                <div className="text-center">
                  <h2 className="text-sm sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 sm:mb-4">
                    Idade Atual
                  </h2>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3">
                    {detailedAge.years > 0 && (
                      <Badge
                        variant="secondary"
                        className="baby-born-badge-animated px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base font-bold bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                      >
                        {detailedAge.years}{" "}
                        {detailedAge.years === 1 ? "ano" : "anos"}
                      </Badge>
                    )}
                    {detailedAge.months > 0 && (
                      <Badge
                        variant="secondary"
                        className="baby-born-badge-animated px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base font-bold bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      >
                        {detailedAge.months}{" "}
                        {detailedAge.months === 1 ? "mês" : "meses"}
                      </Badge>
                    )}
                    {detailedAge.days > 0 && (
                      <Badge
                        variant="secondary"
                        className="baby-born-badge-animated px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                      >
                        {detailedAge.days}{" "}
                        {detailedAge.days === 1 ? "dia" : "dias"}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Contador Detalhado em Tempo Real */}
              <div className="baby-born-counter-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {/* Total de Dias */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-pink-200/50 dark:border-pink-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pink-600 dark:text-pink-400 mb-0.5 sm:mb-1">
                      {babyAge.totalDays}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide leading-tight">
                      Dias de Vida
                    </div>
                  </div>
                </div>

                {/* Dias */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-purple-200/50 dark:border-purple-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-0.5 sm:mb-1">
                      {babyAge.days}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Dias
                    </div>
                  </div>
                </div>

                {/* Horas */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-0.5 sm:mb-1">
                      {babyAge.hours}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Horas
                    </div>
                  </div>
                </div>

                {/* Minutos */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-blue-200/50 dark:border-blue-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-1">
                      {babyAge.minutes}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Minutos
                    </div>
                  </div>
                </div>

                {/* Segundos */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="baby-born-counter-seconds text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-0.5 sm:mb-1 transition-all duration-300">
                      {babyAge.seconds}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Segundos
                    </div>
                  </div>
                </div>

                {/* Semanas */}
                <div className="baby-born-counter-item bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border border-teal-200/50 dark:border-teal-800/30 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-0.5 sm:mb-1">
                      {babyAge.weeks}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Semanas
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas Extras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-pink-200/50 dark:border-pink-800/30">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-bold text-pink-700 dark:text-pink-300 mb-0.5 sm:mb-1">
                      {Math.floor(babyAge.totalDays / 7)} semanas
                    </div>
                    <div className="text-xs sm:text-sm text-pink-600 dark:text-pink-400">
                      e {babyAge.totalDays % 7} dias
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-purple-200/50 dark:border-purple-800/30">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300 mb-0.5 sm:mb-1">
                      {Math.floor(babyAge.totalDays * 24)} horas
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                      de vida total
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-indigo-200/50 dark:border-indigo-800/30 sm:col-span-2 lg:col-span-1">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-300 mb-0.5 sm:mb-1">
                      {Math.floor(babyAge.totalDays * 24 * 60)} minutos
                    </div>
                    <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                      preciosos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
