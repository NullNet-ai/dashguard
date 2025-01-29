"use client";

import React from "react";

function renderComponentSelected(
  /* eslint-disable react/display-name */
  Component: React.ComponentType<{ records: Record<string, any> }>,
): (records: Record<string, any>) => JSX.Element {
  return (records: Record<string, any>) => {
    return <Component records={records} />;
  };
}

export default renderComponentSelected;
