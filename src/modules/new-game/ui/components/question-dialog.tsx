import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropsWithChildren } from "react";
import { QuestionForm } from "./question-form";

export const QuestionDialog = ({ children }: PropsWithChildren) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
        </DialogHeader>
        <QuestionForm />
      </DialogContent>
    </Dialog>
  );
};
