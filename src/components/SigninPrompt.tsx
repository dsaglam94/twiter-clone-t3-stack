import React, { type Dispatch, type SetStateAction } from "react";
import { signIn } from "next-auth/react";
import { AiOutlineClose } from "react-icons/ai";

const SigninPrompt = ({
  onChangePromptOpen,
}: {
  onChangePromptOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-black/70">
      <div className="relative flex flex-col items-center justify-center gap-5 rounded-md bg-gray-200 p-10 shadow">
        <AiOutlineClose
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => onChangePromptOpen(false)}
        />
        <p>Sign in to create a tweet!</p>
        <button
          className="rounded-md bg-primary px-4 py-2 text-white"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default SigninPrompt;
