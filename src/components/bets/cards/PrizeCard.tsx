import React from "react";
import { InfoIcon, TrophyIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PrizeCardProps = {
  totalGuessCount: number;
  guessPrice: number;
};

export const PrizeCard: React.FC<PrizeCardProps> = ({
  totalGuessCount,
  guessPrice,
}) => {
  return (
    <div className="relative mx-auto max-w-xs">
      <Popover>
        <PopoverTrigger asChild>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl p-3 shadow-md border border-emerald-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-emerald-50">
                  Prêmio Total:
                </span>
                <InfoIcon className="h-3.5 w-3.5 text-emerald-100/80" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-white">
                  R${" "}
                  {(totalGuessCount * guessPrice).toFixed(2).replace(".", ",")}
                </span>
                <p className="text-xs text-emerald-100/80 font-medium">
                  {totalGuessCount} palpites × R${" "}
                  {guessPrice.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/80 dark:to-teal-950/80 p-4 shadow-xl border border-emerald-200/70 dark:border-emerald-800/40 rounded-lg backdrop-blur-xl backdrop-saturate-150 z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="font-medium text-emerald-700 dark:text-emerald-300">
                Regras do Prêmio
              </h3>
            </div>
            <ul className="text-sm space-y-2 text-emerald-800 dark:text-emerald-200">
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  •
                </span>
                <span>
                  Se alguém acertar <strong>sozinho</strong> a data exata do
                  nascimento, leva <strong>todo o prêmio</strong>.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  •
                </span>
                <span>
                  Se <strong>várias pessoas</strong> acertarem a mesma data, o
                  prêmio será <strong>dividido igualmente</strong> entre elas.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600 dark:text-teal-400 font-bold">
                  •
                </span>
                <span>
                  Se <strong>ninguém acertar</strong> a data exata, o prêmio
                  será guardado para a <strong>bebê</strong>.
                </span>
              </li>
            </ul>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 italic">
              Clique fora para fechar
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
