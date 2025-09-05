import { useEffect } from "react";

interface CountdownProps {
  countTo: number;
  onFinished?: () => void;
  currentNumber: number;
}

export const Countdown = ({
  countTo,
  currentNumber,
  onFinished,
}: CountdownProps) => {
  useEffect(() => {
    // Handle countdown completion
    if (currentNumber === countTo && onFinished) {
      onFinished();
    }
  }, [currentNumber, countTo, onFinished]);

  return (
    <div className="flex h-full w-full flex-1 items-center justify-center text-8xl font-bold">
      {currentNumber}
    </div>
  );
};
