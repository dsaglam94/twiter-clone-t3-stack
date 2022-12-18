import Image from "next/image";
import React, { useEffect, useState } from "react";
import { type RouterOutputs, type RouterInputs, trpc } from "../utils/trpc";
import CreateTweet from "./CreateTweet";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { debounce } from "lodash";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  type InfiniteData,
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SigninPrompt from "./SigninPrompt";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dh",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const LIMIT = 10;

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  function _handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const windowScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (windowScroll / height) * 100;

    setScrollPosition(scrolled);
  }

  const handleScroll = debounce(_handleScroll, 500);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return scrollPosition;
}

function updateCache({
  client,
  variables,
  data,
  action,
  input,
}: {
  client: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
}) {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }

            return tweet;
          }),
        };
      });

      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}

const Timeline = ({
  where = {},
}: {
  where: RouterInputs["tweet"]["timeline"]["where"];
}) => {
  const scrollPosition = useScrollPosition();
  const client = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      { limit: 10, where },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div>
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            tweet={tweet}
            key={tweet.id}
            client={client}
            input={{
              where,
              limit: LIMIT,
            }}
          />
        ))}
        {!hasNextPage && (
          <div className="flex w-full items-center justify-center pb-4">
            <p className="text-sm text-gray-500">No more tweets to load...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;

function Tweet({
  tweet,
  client,
  input,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
}) {
  const { data: session } = useSession();
  const [isSigninPromptOpen, setIsSigninPromptOpen] = useState<boolean>(false);

  const likeMutation = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "like" });
    },
  }).mutateAsync;
  const unlikeMutation = trpc.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "unlike" });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0 && session?.user;

  const handleLike = () => {
    if (!session?.user) {
      setIsSigninPromptOpen(true);
      return;
    }

    if (hasLiked) {
      unlikeMutation({ tweetId: tweet.id });
      return;
    }

    likeMutation({ tweetId: tweet.id });
  };

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      {isSigninPromptOpen && (
        <SigninPrompt onChangePromptOpen={setIsSigninPromptOpen} />
      )}
      <div className="flex items-center p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile picture`}
            width={48}
            height={48}
            className="rounded-full border-2 border-gray-100"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center gap-2">
            <Link href={`/${tweet.author.name}`}>
              <p className="font-bold">{tweet.author.name}</p>
            </Link>
            <span>-</span>
            <p className="text-xs text-gray-500">
              {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>{tweet.text}</div>
        </div>
      </div>

      <div
        onClick={handleLike}
        className="group flex w-min cursor-pointer items-center gap-1 p-2 "
      >
        {hasLiked ? (
          <AiFillHeart className="text-red-600" size="1.25rem" />
        ) : (
          <AiOutlineHeart
            className="text-gray-600 transition duration-300 ease-in-out group-hover:text-red-600"
            size="1.25rem"
          />
        )}
        <span
          className={`text-sm ${
            hasLiked ? "text-red-600" : "text-gray-600"
          } transition duration-300 ease-in-out group-hover:text-red-600`}
        >
          {tweet._count.likes}
        </span>
      </div>
    </div>
  );
}
