"use client";

import { Leaderboard } from "../components/leaderboard";

export const PlayView = () => {
  return (
    <div className="app-container flex flex-1 flex-col">
      {/* <Countdown /> */}
      {/* <Quiz /> */}
      <Leaderboard />
    </div>
  );
};
