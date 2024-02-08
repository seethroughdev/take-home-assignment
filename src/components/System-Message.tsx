/**
 * The system message component renders the initial prompt to the system.
 */

import OpenAI from "openai";

export const SystemMessage = ({
  message,
}: {
  message?: OpenAI.ChatCompletionMessage;
}) => {
  return (
    <div className={`p-4 text-center`}>
      <p className="text-xs text-slate-400 mb-2">System</p>
      <h2 className="font-semibold text-slate-600">
        {message?.content || "Enter a prompt to get started..."}
      </h2>
    </div>
  );
};
