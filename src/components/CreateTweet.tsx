import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { trpc } from "../utils/trpc";
import { object, string } from "zod";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";

import type { SyntheticEvent } from "react";
import SigninPrompt from "./SigninPrompt";

export const tweetSchema = object({
  text: string({ required_error: "Tweet text is required" }).min(10).max(200),
});

const CreateTweet = () => {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSigninPromptOpen, setIsSigninPromptOpen] = useState<boolean>(false);

  const { data: session } = useSession();

  const utils = trpc.useContext();

  const { mutateAsync } = trpc.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.timeline.invalidate();
    },
  });

  useEffect(() => {
    if (isSigninPromptOpen) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "scroll";
  }, [isSigninPromptOpen]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!session?.user) {
      setIsSigninPromptOpen(true);
      return;
    }

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

  const _onChangeTweet = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setError("");
    setText(target.value);
  };

  const onChangeTweet = debounce(_onChangeTweet, 500);

  return (
    <>
      {error && <p className="bg-red-400 p-1 text-sm text-white">{error}</p>}
      <div className="flex items-start gap-2 bg-gray-700 p-4">
        {isSigninPromptOpen && (
          <SigninPrompt onChangePromptOpen={setIsSigninPromptOpen} />
        )}
        {session?.user?.image && (
          <Link href={`/${session.user.name}`}>
            <Image
              src={session?.user?.image}
              alt={`${session?.user?.name} profile picture`}
              width={48}
              height={48}
              className="rounded-full border-2"
            />
          </Link>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-2 rounded-md bg-gray-700 "
        >
          <textarea
            placeholder="What's happening?"
            defaultValue={text}
            onChange={onChangeTweet}
            className="w-full rounded-md bg-gray-700 p-4 text-gray-300 placeholder:text-xl placeholder:text-gray-500"
          />

          <button
            className="self-end rounded-md bg-primary px-4 py-2 text-white"
            type="submit"
          >
            Tweet
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateTweet;
