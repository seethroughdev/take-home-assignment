/**
 * The generic message component. It handles both user and assistant messages.
 */

import OpenAI from "openai";
import { Button } from "@tremor/react";
import { TrashIcon } from "@heroicons/react/outline";

export const Message = ({
  message,
  label,
  index,
  onDelete,
}: {
  message: OpenAI.ChatCompletionMessage;
  index?: number;
  label?: string;
  onDelete?: (index: number) => void;
}) => {
  const isAssistant = message.role === "assistant";
  const showDelete = onDelete && index && Number.isInteger(index);

  return (
    <div className="my-4">
      <div
        className={`py-1 flex message-${message.role} justify-${
          isAssistant ? "start" : "end"
        }`}
      >
        <div
          className={`relative w-3/4 p-4 rounded-2xl flex ${
            isAssistant
              ? "bg-rose-300 text-white flex-row-reverse"
              : "bg-white text-right flex-row"
          }`}
        >
          {showDelete ? (
            <Button
              className="opacity-50"
              variant="light"
              color={isAssistant ? ("white" as any) : "gray"} // d.ts does not allow white, but the api does}
              tooltip="Delete"
              icon={TrashIcon}
              onClick={() => onDelete(index)}
              size="xs"
            />
          ) : (
            <></>
          )}
          <p className="flex-1">{message.content}</p>
        </div>
      </div>
      <div
        className={`mx-4 text-tremor-label text-slate-300 ${
          isAssistant ? "" : "text-right"
        }`}
      >
        <p>{label || message.role}</p>
      </div>
    </div>
  );
};
