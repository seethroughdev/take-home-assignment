"use client";

import { useState, useEffect } from "react";
import OpenAI from "openai";
import { io, Socket } from "socket.io-client";
import { Message } from "@/components/Message";
import { UserMessage } from "@/components/User-Message";
import { SystemMessage } from "@/components/System-Message";

import {
  SOCKET_URI,
  EVT_USER_MESSAGE,
  EVT_COMPLETION_CHUNK,
  DEFAULT_MESSAGES,
} from "@/contants";

export default function Home() {
  // Instead of iterating and modifying the messages array, I chose to separate the actively
  // changing messages (ie. user, streaming etc.) from the messages list.
  // The benefits:
  // - performance, less iteration and rendering of the lists
  // - smaller memory footprint, we don't need to keep track of all the messages with each keypress
  // - easier to sync to a database, keep current response in-flight, but lock down previous messages
  // - easier to validate in isolation

  // I also elected to remove the manual management of ID's in favor of using native OpenAI type.
  // We could always have extended it, but the tighter coupling will give us a quicker indication of error
  // if they make schema changes, and we can always auto-generate UUID's
  // for our this simple case, we can just use the index of the array as the key
  const [messages, setMessages] =
    useState<OpenAI.ChatCompletionMessage[]>(DEFAULT_MESSAGES);

  // the streamed response from the server, after we know its complete,
  // we'll clean it up, and move it to the messages stack
  const [currentResponse, setCurrentResponse] = useState<string>("");

  // treating our socket as a singleton so we don't risk multiple connections with
  // unexpected react event calls
  const [socket, setSocket] = useState<Socket | null>(null);

  // our init effect
  useEffect(() => {
    async function init() {
      // connect to our socket, but make sure we only do it once
      if (!socket) {
        await fetch(SOCKET_URI);
        setSocket(io());
      }
    }

    // because we're using an async function inside useEffect
    init();

    return () => {
      // cleanup socket on unmount
      socket?.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // now that we have our socket, lets setup our listeners
    socket.on(EVT_COMPLETION_CHUNK, (chunk: string, isLast: boolean) => {
      setCurrentResponse((prevChunk) => {
        const newResponse = prevChunk.concat(chunk);

        if (isLast) {
          // moved this inside the setCurrentResponse since we don't have a promise return on
          // the response update, and we want to make sure we don't miss any messages
          setMessages((prevMessages) => {
            return [
              ...prevMessages,
              { role: "assistant", content: newResponse },
            ];
          });

          // if its the last, we'll reset the current response
          return "";
        }

        // update with latest chunk
        return newResponse;
      });
    });
  }, [socket]);

  useEffect(() => {
    // Had to move this to its own effect to keep track of async changes
    // So any time the messages array is updated, and the latest is a user input,
    // lets send it up to the server.

    if (socket && messages[messages.length - 1]?.role === "user") {
      socket.emit(EVT_USER_MESSAGE, messages);
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 font-normal text-md m-auto bg-slate-100 md:rounded-xl w-full max-w-lg overflow-hidden">
      <div className="mx-auto w-full flex-none max-w-3xl bg-white border-slate-200 border-b">
        <SystemMessage message={messages?.[0]} />
      </div>

      <div className="flex-1 basis-0 overflow-y-scroll px-4">
        {/* only show if there are messages to render */}
        {messages?.length > 1 && (
          <div className="mx-auto w-full max-w-4xl">
            {messages.slice(1).map((message, index) => (
              <Message
                message={message}
                key={index + 1}
                index={index + 1}
                onDelete={(index: number) =>
                  setMessages((prev) => prev.filter((_, i) => i !== index))
                }
              />
            ))}

            {/* Append a current response message only when its active */}
            {currentResponse !== "" && (
              <Message
                message={{ role: "assistant", content: currentResponse }}
                label="assistant is typing..."
              />
            )}
          </div>
        )}
      </div>

      {/* User input */}
      <div className="mx-auto w-full border-t-1 border-slate-100 flex-none">
        <UserMessage
          onSubmit={(content: string) => {
            setMessages((prev) => [...prev, { role: "user", content }]);
          }}
          isDisabled={currentResponse !== ""}
        />
      </div>
    </div>
  );
}
