/**
 * This is the main socket.io server handler. It is responsible for creating the socket.io server and listening for
 * incoming events. It also handles the OpenAI API call and emits the response to the client.
 *
 * This is a very simple implementation and makes assumptions we wouldn't necessarily make in a production application.
 *
 * ie. Loggers, the size of messages being passed, caching, authentication, db state, etc...
 */

import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import OpenAI from "openai";
import { EVT_USER_MESSAGE, EVT_COMPLETION_CHUNK } from "@/contants";

// Setup OPENAI_API_KEY in .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Creating an acceptable type for NextApiResponse to inherit a socket property that contains a server/io
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: any; // not acceptable in production, but will have to dig through internals to get the right type
}

/**
 *  The main handler for the socket.io server
 */
export const Handler = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  // Important that we make sure to only create the server once
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    // Listen for connection events
    io.on("connection", (socket) => {
      console.log(`Socket ${socket.id} connected.`);

      // Would normally point to logger
      socket.onAny((event, ...args) => {
        console.log(event, args);
      });

      // Listen for incoming messages and broadcast to all clients
      socket.on(
        EVT_USER_MESSAGE,
        async (messages: OpenAI.ChatCompletionMessage[]) => {
          if (!messages) return;

          try {
            // Make call to OpenAI API, ideally this would be moved to an interface so the api would only understand
            // an async request that returns message keys, not closely coupled with the OpenAI API
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages,
              temperature: 1,
              max_tokens: 256,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
              stream: true,
            });

            // Iterate over the streaming response and pass chunks as we get them
            for await (const chunk of completion) {
              io.emit(
                EVT_COMPLETION_CHUNK,
                // pass the chunk to the client
                chunk?.choices[0]?.delta?.content || "",
                // let the client know that the completion is finished
                chunk.choices[0].finish_reason === "stop"
              );
            }
          } catch (error) {
            // Return an error if anything fails
            res.status(500).json({ error });
          }
        }
      );

      // Clean up the socket on disconnect
      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected.`);
      });
    });

    // add the io instance to the response object
    res.socket.server.io = io;
  }

  res.end();
};

export default Handler;
