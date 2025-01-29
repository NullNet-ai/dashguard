"use client";

import { useEffect } from "react";
import type { IErrorProps } from "./types";

const Error = (props: IErrorProps) => {
  const { error, reset } = props;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
};

export default Error;
