import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Hero = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="space-y-5 text-center">
        <h1 className="text-4xl font-bold">Spark the Fun with Zap Quiz</h1>
        <p className="text-lg">
          Turn learning, meetings, and events into high-energy quiz games that
          everyone loves.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button>New game</Button>
        <div className="flex items-center gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            variant="ghost"
            onClick={() => router.push(`/${code}/lobby`)}
            disabled={!code}
          >
            Join
          </Button>
        </div>
      </div>
    </div>
  );
};
