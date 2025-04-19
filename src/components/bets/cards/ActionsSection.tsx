import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, UserRound, PlusIcon } from "lucide-react";

type ActionsSectionProps = {
  userIsLoggedIn: boolean;
  allowGuesses: boolean;
  onAddGuess: () => void;
  compact?: boolean;
};

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  userIsLoggedIn,
  allowGuesses,
  onAddGuess,
  compact = true,
}) => {
  return (
    <div className={compact ? "mt-6 mb-6" : "mt-2 mb-2"}>
      <div className="py-4 px-2">
        <div
          className={`flex ${
            compact ? "flex-col" : "flex-col sm:flex-row"
          } justify-center gap-4`}
        >
          <Link href="/guesses" className="w-full sm:w-auto">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              size={compact ? "default" : "lg"}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver todos os palpites
            </Button>
          </Link>

          {userIsLoggedIn && (
            <Link href="/my-guesses" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 w-full sm:w-auto"
                size={compact ? "default" : "lg"}
              >
                <UserRound className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Meus Palpites
              </Button>
            </Link>
          )}

          {allowGuesses && (
            <Button
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              onClick={onAddGuess}
              size={compact ? "default" : "lg"}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Adicionar Palpite
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
