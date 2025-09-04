import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon } from "lucide-react";

const optionIcons = [SquareIcon, CircleIcon, TriangleIcon, StarIcon];

export const Quiz = () => {
  return (
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
              className="flex w-full flex-col justify-center gap-3 rounded-lg p-4"
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
  );
};
