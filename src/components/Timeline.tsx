import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { type RouterOutputs, trpc } from "../utils/trpc";
import CreateTweet from "./CreateTweet";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { debounce } from "lodash";

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

const Timeline = () => {
  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];
  return (
    <div>
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet tweet={tweet} key={tweet.id} />
        ))}
      </div>
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetching}
      >
        Load next
      </button>
    </div>
  );
};

export default Timeline;

function Tweet({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
}) {
  return (
    <div className="mb-4 border-b-2 border-gray-500">
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
            <p className="font-bold">{tweet.author.name}</p>
            <span>-</span>
            <p className="text-xs text-gray-500">
              {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>{tweet.text}</div>
        </div>
      </div>
    </div>
  );
}
