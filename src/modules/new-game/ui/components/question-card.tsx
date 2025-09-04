import { Card, CardContent } from "@/components/ui/card";
import { QuestionCardActions } from "./question-card-actions";

interface QuestionCardProps {
  index: number;
}

export const QuestionCard = ({ index }: QuestionCardProps) => {
  return (
    <Card className="p-4">
      <CardContent className="space-y-4 p-0">
        <div className="flex items-start">
          <p className="flex-1">
            <span className="text-muted-foreground mr-2 inline-block text-sm font-semibold">
              {index + 1}.
            </span>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos.
          </p>
          <QuestionCardActions onEdit={() => {}} onDelete={() => {}} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="flex w-full flex-col justify-center gap-3 rounded-lg px-3 py-2"
            >
              <CardContent className="p-0">Option {index + 1}</CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between p-0">
        <Button size="icon" variant="ghost" className="text-muted-foreground">
          <Trash2Icon className="size-3.5" />
        </Button>
        <Button variant="outline" className="rounded-full">
          <EditIcon /> Edit
        </Button>
      </CardFooter> */}
    </Card>
  );
};
