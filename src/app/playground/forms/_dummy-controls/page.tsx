"use client";
import React from "react";
import GroupTab, { GroupTabType } from "~/components/ui/group-tab";
import GroupTabView from "./draggable-view";
import MultiFieldView from "./multifield-view";

export default function GroupTabWithMultiField() {
  const [selected, setSelected] = React.useState<GroupTabType | null>(null);
  const [data, setData] = React.useState<GroupTabType[]>([
    {
      id: crypto.randomUUID(),
      name: "Group 1",
      content: <MultiFieldView />
    },
    {
      id: crypto.randomUUID(),
      name: "Group 2",
      content: <GroupTabView />
    },
  ]);

  return (
    <GroupTab
      selected={selected}
      tabs={data}
      onValueChange={setData}
      onTabSelect={setSelected}
      onClickAddTab={() => {
        setData([
          ...data,
          {
            id: crypto.randomUUID(),
            name:  `Group ${data.length + 1}`,
            content: <div>Content of tab #: {data?.length + 1}</div>,
          },
        ]);
      }}
    />
  );
}
