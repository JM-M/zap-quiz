"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const questionFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
      }),
    )
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  onSubmit?: (data: QuestionFormValues) => void;
  defaultValues?: Partial<QuestionFormValues>;
}

export const QuestionForm = ({
  onSubmit,
  defaultValues,
}: QuestionFormProps) => {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const handleSubmit = (data: QuestionFormValues) => {
    console.log("Form submitted:", data);
    onSubmit?.(data);
  };

  // const addOption = () => {
  //   if (fields.length < 6) {
  //     append({ text: "" });
  //   }
  // };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Question Field */}
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  className="rounded-2xl"
                  placeholder="Enter your question here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Options</FormLabel>
          </div>

          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`options.${index}.text`}
              render={({ field }) => (
                <FormItem>
                  <div className="relative flex items-center gap-2">
                    <FormControl className="w-full">
                      <Textarea
                        rows={1}
                        className="rounded-2xl"
                        placeholder={`Option ${index + 1}`}
                        {...field}
                      />
                    </FormControl>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="hover:text-destructive absolute right-1 bottom-1"
                      >
                        <Trash2Icon className="size-3" strokeWidth={1.2} />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={fields.length >= 6}
            className="ml-auto flex items-center gap-2 rounded-full font-medium"
          >
            <PlusIcon className="size-4" />
            Add Option
          </Button> */}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="h-12 w-full rounded-full sm:w-auto">
            <PlusIcon className="size-4" />
            Add question
          </Button>
        </div>
      </form>
    </Form>
  );
};
