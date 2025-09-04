import { cn } from "@/lib/utils";
import { LoaderIcon, LucideProps } from "lucide-react";

export const Spinner = ({ className, ...props }: LucideProps) => {
  return <LoaderIcon className={cn("animate-spin", className)} {...props} />;
};
