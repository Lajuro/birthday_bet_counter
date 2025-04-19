import React from "react";
import { BirthGuess } from "@/types";
import { GuessCard } from "./GuessCard";
import { CountdownData } from "@/hooks/useTimeCalculations";
import { debug } from "@/lib/debug";

type NextGuessesSectionProps = {
  guesses: BirthGuess[];
  countdowns: { [key: string]: CountdownData };
  closestGuess?: BirthGuess | null;
};

// Função auxiliar para verificar se dois palpites são do mesmo dia
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Função auxiliar para formatar data como string YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Função auxiliar para formatar lista de nomes com vírgulas e "e" para o último
const formatNameList = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;

  // Para 3 ou mais nomes: "Nome1, Nome2 e Nome3"
  const lastIndex = names.length - 1;
  const firstNames = names.slice(0, lastIndex).join(", ");
  return `${firstNames} e ${names[lastIndex]}`;
};

export const NextGuessesSection: React.FC<NextGuessesSectionProps> = ({
  guesses,
  countdowns,
  closestGuess,
}) => {
  if (guesses.length === 0) return null;

  // Se temos um palpite mais próximo, vamos usá-lo para filtrar
  const closestDate = closestGuess
    ? new Date(closestGuess.guessDate.seconds * 1000)
    : null;

  // Primeiro filtramos os palpites para remover os do mesmo dia do palpite mais próximo
  const filteredGuesses = closestDate
    ? guesses.filter((guess) => {
        const guessDate = new Date(guess.guessDate.seconds * 1000);
        return !isSameDay(guessDate, closestDate);
      })
    : guesses;

  // Se não há palpites após a filtragem, mostramos uma mensagem
  if (filteredGuesses.length === 0) {
    return (
      <div className="space-y-6 relative">
        <h2 className="text-center text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 mb-6">
          Próximos Palpites
          <div className="mt-2 mx-auto w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
        </h2>

        {/* Efeito decorativo para esta seção */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-[40%] blur-3xl -z-10"></div>

        <div className="text-center py-8">
          <div className="inline-block p-4 rounded-full bg-indigo-100/20 dark:bg-indigo-900/20 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-indigo-500 dark:text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Não há mais palpites para datas futuras
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Todos os outros palpites são para a mesma data do palpite mais
            próximo.
          </p>
        </div>
      </div>
    );
  }

  // Adicionar debug para verificar os palpites filtrados
  debug.log("app", "Palpites filtrados:", filteredGuesses);

  // Agora agrupamos os palpites filtrados por dia
  const guessesByDay: { [key: string]: BirthGuess[] } = {};

  filteredGuesses.forEach((guess) => {
    const guessDate = new Date(guess.guessDate.seconds * 1000);
    const dateKey = formatDateKey(guessDate);

    if (!guessesByDay[dateKey]) {
      guessesByDay[dateKey] = [];
    }

    guessesByDay[dateKey].push(guess);
  });

  // Adicionar debug para ver o agrupamento
  debug.log("app", "Agrupados por dia:", guessesByDay);

  // Converter em array e ordenar por data
  const sortedDays = Object.entries(guessesByDay)
    .map(([dateKey, dayGuesses]) => ({
      date: new Date(dateKey),
      guesses: dayGuesses.sort((a, b) => a.userName.localeCompare(b.userName)),
      representativeGuess: dayGuesses[0],
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Adicionar debug para ver os dias ordenados
  debug.log("app", "Dias ordenados:", sortedDays);

  return (
    <div className="space-y-6 relative">
      <h2 className="text-center text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 mb-6">
        Próximos Palpites
        <div className="mt-2 mx-auto w-24 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
      </h2>

      {/* Efeito decorativo para esta seção */}
      <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-[40%] blur-3xl -z-10"></div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          sortedDays.length === 1
            ? "md:grid-cols-1 max-w-md"
            : sortedDays.length === 2
            ? "md:grid-cols-2 max-w-2xl"
            : "md:grid-cols-3 max-w-5xl"
        } gap-4 mx-auto`}
      >
        {/* Mostrar até 3 próximos dias de palpites */}
        {sortedDays.slice(0, 3).map(({ date, guesses: dayGuesses }) => {
          // Extrair lista de nomes e formatá-los com a nova função
          const namesList = dayGuesses.map((g) => g.userName);
          const formattedNames = formatNameList(namesList);

          // Pegar o primeiro palpite como representativo
          const representativeGuess = dayGuesses[0];

          // Log para verificação
          debug.log(
            "app",
            `Dia ${date.toLocaleDateString()}: ${formattedNames}, ID usado para countdown: ${
              representativeGuess.id
            }`
          );

          // Verificar os countdowns disponíveis
          if (!countdowns[representativeGuess.id]) {
            debug.warn(
              "app",
              `Countdown não encontrado para o palpite ID ${representativeGuess.id}`
            );
          }

          // Criamos uma versão do palpite que inclui todos os nomes do mesmo dia
          const displayGuess = {
            ...representativeGuess,
            userName: formattedNames,
          };

          return (
            <div
              key={representativeGuess.id}
              className="transform hover:-translate-y-1 transition-all duration-300"
            >
              <GuessCard
                guess={displayGuess}
                countdown={countdowns[representativeGuess.id]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
