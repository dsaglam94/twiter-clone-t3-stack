import { signIn, useSession } from "next-auth/react";
import React from "react";
import Container from "./Container";

const LoggedOutBanner = () => {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full bg-primary p-4">
      <Container classNames="bg-transparent flex justify-between items-center">
        <p className="text-white ">Do not miss out!</p>
        <button
          onClick={() => signIn()}
          className="px-4 py-2 text-white shadow-md hover:opacity-90"
        >
          Sign in
        </button>
      </Container>
    </div>
  );
};

export default LoggedOutBanner;
