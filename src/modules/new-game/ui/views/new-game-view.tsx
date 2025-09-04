"use client";

import { QuestionsEditor } from "../components/questions-editor";

export const NewGameView = () => {
  return (
    <div className="app-container flex flex-1 flex-col">
      <QuestionsEditor />
    </div>
  );
};
