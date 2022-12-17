import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { objectHasData } from "../utils/helper";

const Navbar = () => {
  const { data: session } = useSession();

  if (objectHasData(session?.user)) {
    return (
      <header className="bg-primary p-4 text-gray-100">
        <nav className="flex items-center justify-between">
          <ul className="flex items-center gap-5">
            <Link href="/">
              <li>Home</li>
            </Link>
            <Link href={`/${session?.user?.name}`}>
              <li>Profile</li>
            </Link>
          </ul>
          <button onClick={() => signOut()}>Sign out</button>
        </nav>
      </header>
    );
  }

  return null;
};

export default Navbar;
