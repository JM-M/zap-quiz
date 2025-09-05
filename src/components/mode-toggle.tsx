"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    }
    // else if (theme === "dark") {
    //   setTheme("system");
    // }
    else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") {
      return <Sun strokeWidth={1.2} className="h-[1.2rem] w-[1.2rem]" />;
    } else if (theme === "dark") {
      return <Moon strokeWidth={1.2} className="h-[1.2rem] w-[1.2rem]" />;
    } else {
      return <Monitor strokeWidth={1.2} className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme}>
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
