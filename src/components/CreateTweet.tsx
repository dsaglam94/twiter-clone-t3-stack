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
    } catch (e) {
      if (e instanceof Error) {
        const { message } = JSON.parse(e.message)[0];
        setError(message);
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
      {error && <p className="bg-red-400 p-1 text-sm text-white">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-2 rounded-md border-2 p-4"
      >
        <textarea
          onChange={(e) => {
            setError("");
            setText(e.target.value);
          }}
          className="w-full p-4 shadow"
        />

        <button
          className="self-end rounded-md bg-primary px-4 py-2 text-white"
          type="submit"
        >
          Tweet
        </button>
      </form>
    </>
  );
};

export default CreateTweet;
