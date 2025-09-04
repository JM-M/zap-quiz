import { useEffect, useState } from "react";

interface CountdownProps {
  startFrom: number;
  countTo: number;
  onNumberReached?: (number: number) => void;
}

export const Countdown = ({
  startFrom,
  countTo,
  onNumberReached,
}: CountdownProps) => {
  const [currentNumber, setCurrentNumber] = useState(startFrom);

  useEffect(() => {
    if (currentNumber === countTo) {
      return;
    }

    const timer = setTimeout(() => {
      const nextNumber = currentNumber + (countTo > startFrom ? 1 : -1);
      setCurrentNumber(nextNumber);

      if (onNumberReached) {
        onNumberReached(nextNumber);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentNumber, countTo, startFrom, onNumberReached]);

  return (
    <div className="flex h-full w-full flex-1 items-center justify-center text-8xl font-bold">
      {currentNumber}
    </div>
  );
};
