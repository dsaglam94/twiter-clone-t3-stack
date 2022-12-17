import React, { useState } from "react";
import type { SyntheticEvent } from "react";
import { trpc } from "../utils/trpc";
import { object, string } from "zod";

export const tweetSchema = object({
  text: string({ required_error: "Tweet text is required" }).min(10).max(200),
});

const CreateTweet = () => {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { mutateAsync } = trpc.tweet.create.useMutation();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      await tweetSchema.parse({ text });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      } else {
        setError("Something went wrong!");
        return;
      }
    }

    mutateAsync({ text });
  };

  return (
    <>
      {error && JSON.stringify(error)}
      <form onSubmit={handleSubmit}>
        <textarea onChange={(e) => setText(e.target.value)} />

        <button type="submit">Tweet</button>
      </form>
    </>
  );
};

export default CreateTweet;
