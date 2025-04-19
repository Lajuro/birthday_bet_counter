import React from "react";
import { CountdownData, BabyAgeData } from "@/hooks/useTimeCalculations";

type TimeDisplayProps = {
  data: CountdownData | BabyAgeData;
  title: string;
  subtitle?: string;
  isMain?: boolean;
  type?: "gestational" | "countdown" | "guess";
};

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  data,
  title,
  subtitle,
  isMain = false,
  type = "countdown",
}) => {
  if (!data) return null;

  // Definir classes e cores com base no tipo
  let cardClasses =
    "rounded-lg border shadow-sm transition-all duration-300 overflow-hidden h-full";
  const bgGradient = "bg-white dark:bg-slate-900";
  let borderColor = "border-slate-200 dark:border-slate-800";
  let titleColor = "text-purple-600 dark:text-purple-400";
  const subtitleColor = "text-slate-500 dark:text-slate-400";
  let numberColor = "text-purple-600 dark:text-purple-400";
  const labelColor = "text-slate-500 dark:text-slate-400";
  let progressColors = "from-purple-500 to-indigo-500";
  let pillColor =
    "bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";

  // Ajustar estilos baseados no tipo
  if (type === "gestational") {
    borderColor = "border-emerald-200 dark:border-emerald-800/60";
    titleColor = "text-emerald-600 dark:text-emerald-400";
    numberColor = "text-emerald-600 dark:text-emerald-400";
    progressColors = "from-emerald-500 to-teal-500";
    pillColor =
      "bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  } else if (type === "countdown") {
    borderColor = "border-indigo-200 dark:border-indigo-800/60";
    titleColor = "text-indigo-600 dark:text-indigo-400";
    numberColor = "text-indigo-600 dark:text-indigo-400";
    progressColors = "from-indigo-500 to-blue-500";
    pillColor =
      "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
  } else if (type === "guess") {
    borderColor = "border-indigo-200 dark:border-indigo-800/60";
    titleColor = "text-indigo-600 dark:text-indigo-400";
    numberColor = "text-indigo-600 dark:text-indigo-400";
    progressColors = "from-indigo-500 to-purple-500";
    pillColor =
      "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
  }

  if (isMain) {
    cardClasses += " hover:shadow-md hover:-translate-y-1";
  }

  // Para contagens de tempo, determinar se mostramos semanas ou apenas dias
  const showWeeks = type === "gestational";
  const gridCols = showWeeks ? "grid-cols-5" : "grid-cols-4";

  // Definir tamanhos com base em se é um card principal ou secundário
  // Cards de contagem regressiva e idade gestacional serão menores
  const headerPadding = isMain ? "p-3 sm:p-4" : "p-2";
  const contentPadding = isMain ? "p-3 sm:p-4" : "p-2";
  const numberSize = isMain ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";
  const titleSize = isMain ? "text-lg sm:text-xl" : "text-sm";
  const subtitleSize = isMain ? "text-sm" : "text-xs";
  const pillPadding = isMain ? "px-3 py-2" : "px-2 py-1.5";

  return (
    <div className={`${cardClasses} ${borderColor} ${bgGradient}`}>
      {/* Cabeçalho do card */}
      <div
        className={`${headerPadding} border-b ${borderColor} flex items-center justify-between`}
      >
        <div className="flex flex-col">
          <h3 className={`font-bold ${titleColor} ${titleSize}`}>{title}</h3>
          {subtitle && (
            <p className={`${subtitleSize} ${subtitleColor} mt-0.5`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className={contentPadding}>
        {/* Contadores de tempo */}
        <div className={`grid ${gridCols} gap-2 text-center`}>
          {showWeeks && (
            <div className="flex flex-col items-center justify-center">
              <div
                className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
                <span
                  className={`${numberSize} font-bold ${numberColor} relative`}
                >
                  {data.weeks}
                </span>
                <span className={`text-xs font-medium ${labelColor} relative`}>
                  Semanas
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative`}
              >
                {showWeeks ? data.days : Math.floor(data.weeks * 7 + data.days)}
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
                {data.hours}
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
                {data.minutes}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Min
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={`${pillColor} ${pillPadding} rounded-lg flex flex-col items-center justify-center w-full shadow-inner border border-indigo-200/50 dark:border-indigo-800/30 backdrop-blur-sm relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent"></div>
              <span
                className={`${numberSize} font-bold ${numberColor} relative`}
              >
                {data.seconds}
              </span>
              <span className={`text-xs font-medium ${labelColor} relative`}>
                Seg
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        {"progress" in data && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className={`${labelColor} font-semibold`}>Progresso</span>
              <span
                className={`${titleColor} bg-indigo-100/50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full font-semibold`}
              >
                {Math.round(data.progress || 0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100/70 dark:bg-slate-800/70 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className={`h-full bg-gradient-to-r ${progressColors} rounded-full transition-all duration-500 ease-in-out relative`}
                style={{ width: `${data.progress || 0}%` }}
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 dark:bg-white/10 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Informação adicional - só mostra nos cards principais ou quando não há outra informação */}
        {"totalDays" in data && showWeeks && isMain && (
          <div
            className={`mt-3 ${pillColor} text-center rounded-md py-1.5 px-3 text-xs font-medium shadow-sm border border-indigo-200/70 dark:border-indigo-800/30 backdrop-blur-sm`}
          >
            <span className="text-indigo-900 dark:text-indigo-300 font-semibold">
              Total:
            </span>{" "}
            {data.totalDays} dias ({data.weeks} semanas e {data.days} dias)
          </div>
        )}
      </div>
    </div>
  );
};
