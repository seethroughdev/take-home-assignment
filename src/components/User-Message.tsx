/**
 * The user input component that is used to submit messages to the system.
 */

import { useState } from "react";
import { Button } from "@tremor/react";
import { PaperAirplaneIcon } from "@heroicons/react/solid";

export const UserMessage = ({
  isDisabled = false,
  onSubmit,
}: {
  isDisabled: boolean;
  onSubmit: (content: string) => void;
}) => {
  const [currentInputMessage, setCurrentInputMessage] = useState<string>("");

  // Reset the input after submitting
  function handleSubmit() {
    onSubmit(currentInputMessage);
    setCurrentInputMessage("");
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <input
        className="shadow-none h-20 text-center w-full focus:outline-none px-100 border-slate-200 border-t"
        type="text"
        placeholder="Type something here..."
        onChange={(e) => {
          setCurrentInputMessage(e.target.value);
        }}
        value={currentInputMessage}
        autoFocus
      />
      <Button
        className="absolute right-10 top-0 bottom-0 opacity-40 rotate-90"
        variant="light"
        color="rose"
        tooltip="Delete"
        icon={PaperAirplaneIcon}
        type="submit"
        disabled={isDisabled || currentInputMessage === ""}
        size="xl"
      />
    </form>
  );
};
