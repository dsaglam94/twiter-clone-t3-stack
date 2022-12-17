import "../styles/globals.css";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";

import Container from "../components/Container";
import LoggedOutBanner from "../components/LoggedOutBanner";

import { type AppType } from "next/app";
import { type Session } from "next-auth";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Container>
        <main>
          <Component {...pageProps} />
        </main>
      </Container>
      <LoggedOutBanner />
      <ReactQueryDevtools />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
