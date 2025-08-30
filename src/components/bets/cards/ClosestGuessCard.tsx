import React from "react";
import { CountdownData } from "@/hooks/useTimeCalculations";
import { ClosestGuessResult } from "@/hooks/useBabyData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BirthGuess } from "@/types";
import { debug } from "@/lib/debug";

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

type ClosestGuessCardProps = {
  closestGuess: ClosestGuessResult;
  countdown: CountdownData | undefined;
  nextGuesses?: BirthGuess[]; // Nova prop para receber os próximos palpites
  countdowns?: { [key: string]: CountdownData }; // Nova prop para os countdowns dos próximos palpites
};

export const ClosestGuessCard: React.FC<ClosestGuessCardProps> = ({
  closestGuess,
  countdown,
  nextGuesses = [],
  countdowns = {},
}) => {
  // Log detalhado do palpite mais próximo e dos próximos palpites
  debug.log(
    "app",
    "Palpite recebido como mais próximo:",
    closestGuess?.guess
      ? {
          id: closestGuess.guess.id,
          name: closestGuess.guess.userName,
          date: closestGuess.guess.guessDate
            ? new Date(
                closestGuess.guess.guessDate.toDate()
              ).toLocaleDateString()
            : "sem data",
        }
      : "nulo"
  );

  debug.log(
    "app",
    "Próximos palpites disponíveis:",
    nextGuesses.map((g) => ({
      id: g.id,
      name: g.userName,
      date: new Date(g.guessDate.seconds * 1000).toLocaleDateString(),
    }))
  );

  if (!closestGuess?.guess && nextGuesses.length === 0) return null;

  // Verificamos se o palpite mais próximo é válido
  const isClosestGuessValid =
    closestGuess?.guess !== null && countdown !== undefined;

  // Convertemos a data do palpite para um objeto Date para comparação
  const guessDate =
    isClosestGuessValid && closestGuess?.guess?.guessDate
      ? new Date(closestGuess.guess.guessDate.toDate())
      : null;

  // Verificar se a data já passou (comparando com a data atual)
  const currentDate = new Date();
  const dateHasPassed = guessDate ? guessDate < currentDate : false;

  // Se a data do palpite mais próximo já passou, E existem próximos palpites,
  // usamos o primeiro palpite da lista de próximos como o mais próximo
  if (dateHasPassed && nextGuesses.length > 0) {
    const nextGuess = nextGuesses[0];
    const nextGuessCountdown = countdowns[nextGuess.id];

    debug.log("app", "Palpite mais próximo passou, usando próximo:", {
      id: nextGuess.id,
      name: nextGuess.userName,
    });

    // Se temos um próximo palpite válido com countdown, usamos ele
    if (nextGuess && nextGuessCountdown) {
      // Preparar os dados para exibição
      const nextGuessDate = new Date(nextGuess.guessDate.seconds * 1000);
      const formattedNextDate = format(nextGuessDate, "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });

      return renderGuessCard({
        guess: nextGuess,
        countdown: nextGuessCountdown,
        formattedDate: formattedNextDate,
        sameDayGuesses: [], // Não temos esta informação para os próximos palpites
      });
    }
  }

  // Se a data do palpite já passou e não temos próximos palpites, mostramos a mensagem
  if (dateHasPassed) {
    return (
      <div className="w-full mb-4">
        <div className="w-full relative bg-gradient-to-b from-amber-950/30 to-slate-950/50 rounded-lg overflow-hidden shadow border border-amber-800/20">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          <div className="pt-5 px-4 pb-5 text-center">
            <h2 className="text-center text-xl font-bold text-amber-400 mb-3">
              Palpite Mais Próximo
            </h2>

            <p className="text-slate-100 opacity-90">
              Não há palpites para datas futuras.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              O último palpite foi para {guessDate?.toLocaleDateString("pt-BR")}
              , que já passou.
            </p>
          </div>

          {/* Barra decorativa inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        </div>
      </div>
    );
  }

  // Verificar se temos countdown válido para continuar
  if (!countdown) return null;

  // Formatar a data usando date-fns no estilo "21 de abril de 2025"
  const formattedDate = closestGuess.guess?.guessDate
    ? format(closestGuess.guess.guessDate.toDate(), "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : "";

  return renderGuessCard({
    guess: closestGuess.guess,
    countdown,
    formattedDate,
    sameDayGuesses: closestGuess.sameDayGuesses,
  });
};

// Função auxiliar para renderizar o card do palpite
const renderGuessCard = ({
  guess,
  countdown,
  formattedDate,
  sameDayGuesses = [],
}: {
  guess: BirthGuess | null;
  countdown: CountdownData;
  formattedDate: string;
  sameDayGuesses?: BirthGuess[];
}) => {
  if (!guess || !countdown) return null;

  // Log para debugar qual palpite está sendo renderizado como o mais próximo
  debug.log("app", "Renderizando palpite como mais próximo:", {
    id: guess.id,
    name: guess.userName,
    date: formattedDate,
  });

  // Formatar número com zero à esquerda
  const padZero = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  // Determinar o texto de liderança com base em se há outros palpites para o mesmo dia
  const getLeadershipText = () => {
    // Se não há outros palpites no mesmo dia, retornar apenas o nome do palpite principal
    if (!sameDayGuesses || sameDayGuesses.length === 0) {
      return (
        <p className="text-slate-100 opacity-90">
          <span className="font-medium">{guess?.userName}</span> está na
          liderança com um palpite para:
        </p>
      );
    }

    // Se há outros palpites no mesmo dia, criar uma lista formatada com todos os nomes
    const allNames = [
      guess?.userName,
      ...sameDayGuesses.map((g) => g.userName),
    ].filter(Boolean) as string[];

    // Usar a função formatNameList para formatar os nomes
    const formattedNames = formatNameList(allNames);

    return (
      <p className="text-slate-100 opacity-90">
        <span className="font-medium">{formattedNames}</span>{" "}
        {allNames.length > 1 ? "estão" : "está"} na liderança com um palpite
        para:
      </p>
    );
  };

  // Determinar quantas colunas serão exibidas (para ajustar o layout dinamicamente)
  const showWeeks = countdown.weeks > 0;
  const showDays = countdown.days > 0;
  const visibleColumns = (showWeeks ? 1 : 0) + (showDays ? 1 : 0) + 3; // +3 para horas, minutos e segundos que sempre são mostrados

  // Ajustar classes de largura com base na quantidade de colunas
  const getColumnWidthClass = () => {
    switch (visibleColumns) {
      case 3:
        return "w-24"; // Somente horas, minutos e segundos
      case 4:
        return "w-20"; // 4 colunas
      case 5:
        return "w-16"; // Todas as 5 colunas
      default:
        return "w-16";
    }
  };

  const columnWidthClass = getColumnWidthClass();

  return (
    <div className="w-full mb-4">
      <div className="w-full relative bg-gradient-to-b from-amber-950/30 to-slate-950/50 rounded-lg overflow-hidden shadow border border-amber-800/20">
        {/* Barra decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        <div className="pt-5 px-4 pb-5">
          <h2 className="text-center text-xl font-bold text-amber-400 mb-3">
            Palpite Mais Próximo
          </h2>

          <div className="text-center">
            {/* Exibir o texto de liderança formatado */}
            {getLeadershipText()}

            <p className="text-2xl font-bold mt-2 mb-3 text-amber-300">
              {formattedDate}
            </p>

            <div className="mt-4">
              <h3 className="text-base font-semibold text-amber-400 mb-2">
                Faltam
              </h3>

              <div className="flex justify-center items-center gap-3 py-2">
                {/* Semanas - exibir apenas se for maior que zero */}
                {showWeeks && (
                  <div
                    className={`flex flex-col items-center ${columnWidthClass}`}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded w-14 h-14 flex items-center justify-center">
                      {padZero(countdown.weeks)}
                    </div>
                    <span className="text-sm text-amber-500/80 mt-1">
                      {countdown.weeks === 1 ? "semana" : "semanas"}
                    </span>
                  </div>
                )}

                {/* Dias - exibir apenas se for maior que zero */}
                {showDays && (
                  <div
                    className={`flex flex-col items-center ${columnWidthClass}`}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded w-14 h-14 flex items-center justify-center">
                      {padZero(countdown.days)}
                    </div>
                    <span className="text-sm text-amber-500/80 mt-1">
                      {countdown.days === 1 ? "dia" : "dias"}
                    </span>
                  </div>
                )}

                {/* Horas - sempre exibir */}
                <div
                  className={`flex flex-col items-center ${columnWidthClass}`}
                >
                  <div className="text-2xl md:text-3xl font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded w-14 h-14 flex items-center justify-center">
                    {padZero(countdown.hours)}
                  </div>
                  <span className="text-sm text-amber-500/80 mt-1">hrs</span>
                </div>

                {/* Minutos - sempre exibir */}
                <div
                  className={`flex flex-col items-center ${columnWidthClass}`}
                >
                  <div className="text-2xl md:text-3xl font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded w-14 h-14 flex items-center justify-center">
                    {padZero(countdown.minutes)}
                  </div>
                  <span className="text-sm text-amber-500/80 mt-1">min</span>
                </div>

                {/* Segundos - sempre exibir */}
                <div
                  className={`flex flex-col items-center ${columnWidthClass}`}
                >
                  <div className="text-2xl md:text-3xl font-bold text-amber-300 bg-amber-950/40 px-2 py-1 rounded w-14 h-14 flex items-center justify-center">
                    {padZero(countdown.seconds)}
                  </div>
                  <span className="text-sm text-amber-500/80 mt-1">seg</span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-slate-800/50 h-1.5 mt-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  style={{ width: `${countdown.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      </div>
    </div>
  );
};
