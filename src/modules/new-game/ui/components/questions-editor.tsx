import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { QuestionCard } from "./question-card";
import { QuestionDialog } from "./question-dialog";

export const QuestionsEditor = () => {
  return (
    <div className="flex-1 space-y-4 pb-24">
      {Array.from({ length: 10 }).map((_, index) => (
        <QuestionCard key={index} index={index} />
      ))}

      <QuestionDialog>
        <Button className="fixed right-5 bottom-10 h-12 rounded-full !px-5">
          <PlusIcon className="size-4" />
          Add question
        </Button>
      </QuestionDialog>
    </div>
  );
};
