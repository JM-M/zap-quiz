import { Spinner } from "@/components/spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  GameGetCurrentPlayer,
  GameGetGameQuestions,
  GameGetOneByCode,
} from "../../types";

const optionIcons = [SquareIcon, CircleIcon, TriangleIcon, StarIcon];

interface QuizProps {
  game: GameGetOneByCode;
  questions: GameGetGameQuestions;
  currentQuestionIndex: number;
  currentPlayer: GameGetCurrentPlayer;
  setScreen: (screen: "countdown" | "quiz" | "leaderboard") => void;
}

export const Quiz = ({
  game,
  questions,
  currentQuestionIndex,
  currentPlayer,
  setScreen,
}: QuizProps) => {
  const playerId = currentPlayer.id;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const startTime = useRef<number>(Date.now());

  const trpc = useTRPC();
  const saveAnswerMutation = useMutation(
    trpc.game.savePlayerAnswer.mutationOptions(),
  );

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null || !playerId) return;

    const timeToAnswer = Date.now() - startTime.current;

    setSelectedOption(optionIndex);
    saveAnswerMutation.mutate({
      playerId,
      questionId: currentQuestion.id,
      optionId: options[optionIndex].id,
      timeToAnswer,
    });
  };

  useEffect(() => {
    if (selectedOption !== null) {
      setTimeout(() => {
        setScreen("leaderboard");
      }, 2000);
    }
  }, [selectedOption]);

  // Reset timer when question changes
  useEffect(() => {
    startTime.current = Date.now();
  }, [currentQuestionIndex]);

  const { title } = game;

  const currentQuestion = questions[currentQuestionIndex];
  const { prompt, options } = currentQuestion;

  return (
    <>
      <h2 className="text-center font-semibold">{title}</h2>
      <div className="py-5 text-center text-2xl font-bold">
        {currentQuestionIndex + 1}.
      </div>
      {selectedOption !== null && (
        <div className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/70 text-white backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Waiting for others...</span>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-end gap-5 pb-10">
        <p className="flex flex-1 items-center justify-center text-center text-2xl font-semibold">
          {prompt}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option, index) => {
            const Icon = optionIcons[index];
            return (
              <Card
                key={index}
                className={cn(
                  "flex w-full flex-col justify-center gap-3 rounded-lg p-4",
                  selectedOption === index && "bg-primary/10",
                )}
                onClick={() => handleOptionSelect(index)}
              >
                <CardHeader className="p-0">
                  <Icon className="size-5 fill-current" />
                </CardHeader>
                <CardContent className="p-0">{option.text}</CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};
