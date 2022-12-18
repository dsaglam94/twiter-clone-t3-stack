import Head from "next/head";
import Timeline from "../components/Timeline";

import { type NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Twitter | Clone | T3 Stack</title>
        <meta
          name="description"
          content="Created with T3 stack in order to practice tRPC, TypeScript to bring end-to-end type safety to the web world!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Timeline where={{}} />
    </>
  );
};

export default Home;
