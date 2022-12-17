import React from "react";
import Navbar from "./Navbar";

const Container = ({
  children,
  classNames = "",
}: {
  children: React.ReactNode;
  classNames?: string;
}) => {
  return (
    <div className={`m-auto max-w-2xl bg-slate-400 ${classNames}`}>
      <Navbar />
      {children}
    </div>
  );
};

export default Container;
