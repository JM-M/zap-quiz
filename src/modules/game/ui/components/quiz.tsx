import { Spinner } from "@/components/spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon } from "lucide-react";
import { useState } from "react";

const optionIcons = [SquareIcon, CircleIcon, TriangleIcon, StarIcon];

export const Quiz = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <>
      {selectedOption !== null && (
        <div className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-black/70 text-white backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Waiting for others...</span>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-end gap-5 pb-10">
        <div className="flex flex-1 items-center justify-center">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
          officiis non deserunt expedita nobis, adipisci sequi in et ipsa esse
          autem minima voluptatibus porro asperiores assumenda perspiciatis,
          aliquid earum officia?
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => {
            const Icon = optionIcons[index];
            return (
              <Card
                key={index}
                className={cn(
                  "flex w-full flex-col justify-center gap-3 rounded-lg p-4",
                  selectedOption === index && "bg-primary/10",
                )}
                onClick={() => setSelectedOption(index)}
              >
                <CardHeader className="p-0">
                  <Icon className="size-5 fill-current" />
                </CardHeader>
                <CardContent className="p-0">Option {index + 1}</CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};
