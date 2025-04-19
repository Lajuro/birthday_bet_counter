"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ShieldAlert, CalendarClock, PlusIcon } from "lucide-react";
import { GuessForm } from "@/components/bets/guess-form";

// Hooks personalizados
import { useBabyData } from "@/hooks/useBabyData";
import { useTimeCalculations } from "@/hooks/useTimeCalculations";

// Componentes para diferentes partes da UI
import { BabyBornCard } from "@/components/bets/cards/BabyBornCard";
import { PrizeCard } from "@/components/bets/cards/PrizeCard";
import { MainCounters } from "@/components/bets/counters/MainCounters";
import { ClosestGuessCard } from "@/components/bets/cards/ClosestGuessCard";
import { NextGuessesSection } from "@/components/bets/cards/NextGuessesSection";
import { ActionsSection } from "@/components/bets/cards/ActionsSection";

export default function Home() {
  const { isLoading, user } = useAuth();
  const [guessFormOpen, setGuessFormOpen] = useState(false);

  // Dados da aplicação (settings, palpites, etc)
  const {
    appSettings,
    closestGuess,
    nextGuesses,
    loading,
    error,
    totalGuessCount,
    refreshData,
    babyBorn,
    allowGuesses,
  } = useBabyData();

  // Cálculos de tempo (countdowns, idade do bebê, etc)
  const { countdowns, babyAge, gestationalAge, expectedBirthCountdown } =
    useTimeCalculations(appSettings, closestGuess?.guess || null, nextGuesses);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error === "acesso_negado") {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Contador de Palpites
          </h1>
          <p className="text-lg text-muted-foreground">
            Nascimento da {appSettings?.babyName || "Chloe"}
          </p>
        </header>

        <Card className="w-full max-w-md mx-auto bg-card/50">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Para visualizar os palpites e a contagem regressiva, você precisa
              estar logado no sistema.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/admin/login" passHref>
                <Button size="lg">Entrar para participar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (
    error === "erro_geral" ||
    (!closestGuess?.guess && nextGuesses.length === 0)
  ) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Contador de Palpites
          </h1>
          <p className="text-lg text-muted-foreground">
            Nascimento da {appSettings?.babyName || "Chloe"}
          </p>
        </header>

        <Card className="w-full max-w-md mx-auto bg-card/50">
          <CardHeader className="text-center">
            <CalendarClock className="w-12 h-12 mx-auto text-primary/70 mb-2" />
            <CardTitle className="text-xl">Ainda não há palpites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center font-medium text-base text-slate-700 dark:text-slate-300">
              {error === "erro_geral"
                ? "Não foi possível carregar os dados dos palpites. Por favor, tente novamente mais tarde."
                : "Seja o primeiro a registrar um palpite para o nascimento da Chloe!"}
            </p>
            <div className="flex justify-center mt-4">
              {error === "erro_geral" ? (
                <Button size="lg" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              ) : (
                <Link href="/admin" passHref>
                  <Button size="lg">Fazer meu palpite</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col font-sans">
      {/* Botão fixo para adicionar palpite */}
      {allowGuesses && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Button
            onClick={() => setGuessFormOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
            size="icon"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      )}

      <header className="pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8 px-4 text-center relative overflow-hidden">
        {/* Efeito decorativo de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-72 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[100%] blur-3xl -z-10 transform -translate-y-1/3"></div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-2 animate-fade-in">
          Contador de Palpites
        </h1>

        <div className="mt-5 mb-4">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight inline-block">
            <span className="bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 px-5 py-1.5 rounded-full shadow-sm border border-indigo-300/30 dark:border-indigo-700/30">
              {appSettings?.babyName || "Bebê"}
            </span>
          </h2>
        </div>

        {/* Divider decorativo */}
        <div className="flex items-center justify-center my-8">
          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
          <div className="mx-3 text-lg text-indigo-400 dark:text-indigo-500">
            ✦
          </div>
          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
        </div>

        {/* Componente para exibir o valor total do prêmio */}
        {(closestGuess?.guess || nextGuesses.length > 0) && (
          <PrizeCard
            totalGuessCount={totalGuessCount}
            guessPrice={appSettings?.guessPrice || 10}
          />
        )}
      </header>

      <div className="container mx-auto px-4 relative">
        {babyBorn ? (
          // Exibição quando o bebê já nasceu
          <BabyBornCard
            settings={appSettings}
            babyAge={babyAge}
            winningGuess={closestGuess}
          />
        ) : (
          // Exibição quando o bebê ainda não nasceu
          <div className="w-full max-w-5xl mx-auto">
            {/* Contadores principais (data provável e idade gestacional) */}
            <div className="lg:col-span-3 mb-16">
              <MainCounters
                expectedBirthCountdown={expectedBirthCountdown}
                gestationalAge={gestationalAge}
                settings={appSettings}
              />
            </div>

            {/* Nova estrutura de layout */}
            <div className="grid grid-cols-1 gap-8 md:gap-10">
              {/* Palpite mais próximo em destaque - ocupando toda a largura */}
              {closestGuess?.guess && countdowns[closestGuess.guess.id] && (
                <div className="w-full">
                  <ClosestGuessCard
                    closestGuess={closestGuess}
                    countdown={countdowns[closestGuess.guess.id]}
                  />
                </div>
              )}

              {/* Próximos palpites - ocupando toda a largura */}
              {nextGuesses.length > 0 && (
                <div className="w-full max-w-full">
                  <NextGuessesSection
                    guesses={nextGuesses}
                    countdowns={countdowns}
                    closestGuess={closestGuess?.guess}
                  />
                </div>
              )}

              {/* Área de ações do usuário - abaixo dos próximos palpites e com visual mais discreto */}
              <div className="w-full flex justify-center mt-2 mb-5">
                <div className="w-full max-w-5xl bg-indigo-950/30 backdrop-blur-sm border border-indigo-900/20 rounded-xl p-4 shadow-md">
                  <h3 className="text-center text-lg font-medium text-indigo-300 mb-4">
                    Ações
                  </h3>
                  <ActionsSection
                    userIsLoggedIn={!!user}
                    allowGuesses={allowGuesses}
                    onAddGuess={() => setGuessFormOpen(true)}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulário de palpites */}
      <GuessForm
        open={guessFormOpen}
        onOpenChange={setGuessFormOpen}
        onSuccess={refreshData}
      />
    </main>
  );
}
