"use client";

import { useState } from "react";

import Fields from "./Fields";
import Filters from "./Filters";
import Groups from "./Groups";
import Sorts from "./Sorts";
import { cn } from "~/lib/utils";
import { capitalize } from "lodash";
import { Button } from "~/components/ui/button";
// import { useCategoryContext } from "./Provider";
import Apply from "./Apply";

export default function TabSettings() {
  // const { state } = useCategoryContext();
  // const { filters } = state?.storeUnsaved ?? {};
  const [filterTab, setFilterTab] = useState([
    { name: "Fields", href: "#", current: true, component: Fields },
    { name: "Filters", href: "#", current: false, component: Filters },
    { name: "Group", href: "#", current: false, component: Groups },
    { name: "Sort", href: "#", current: false, component: Sorts },
    { name: "Apply", href: "#", current: false, component: Apply },
  ]);
  const [selected, setSelected] = useState("Fields");

  const handleFilterTab = (index: number) => {
    const newTab = [...filterTab];
    newTab.forEach((tab, i) => {
      if (i === index) {
        tab.current = true;
      } else {
        tab.current = false;
      }
    });

    if (filterTab[index]) {
      setSelected(filterTab[index].name);
    }
    setFilterTab(newTab);
  };

  const selectedTab = (filterTab: string) => {
    switch (filterTab) {
      case "Fields":
        return <Fields />;
      case "Filters":
        return <Filters />;
      case "Group":
        return <Groups />;
      case "Sort":
        return <Sorts />;
      case "Apply":
        return <Apply />;
      default:
        return <Fields />;
    }
  };

  return (
    <div className="w-full">
      <section
        className="item-center flex flex-row justify-between"
        aria-labelledby="filter-heading"
      >
        <nav aria-label="Tabs" className={cn("flex flex-1 justify-between")}>
          <div className="flex">
            {filterTab?.slice(0, -1).map((tab, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center",
                  tab.current && "border-b-4 border-white",
                )}
              >
                <Button
                  onClick={() => handleFilterTab(index)}
                  variant={"ghost"}
                  aria-current={tab.current ? "page" : undefined}
                  className={cn(
                    tab.current
                      ? "rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary text-primary"
                      : "text-gray-500",
                    "whitespace-nowrap px-4 pt-2 text-sm font-medium",
                    "flex items-center space-x-2",
                  )}
                >
                  {capitalize(tab.name)}
                </Button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center">
              <Button
                onClick={() => handleFilterTab(filterTab.length - 1)}
                variant={"ghost"}
                aria-current={
                  filterTab?.[filterTab.length - 1]?.current
                    ? "page"
                    : undefined
                }
                className={cn(
                  filterTab?.[filterTab.length - 1]?.current
                    ? "rounded-t-lg border-b-0 border-l border-r border-t-2 border-t-primary text-primary"
                    : "text-gray-500",
                  "whitespace-nowrap px-4 pt-2 text-sm font-medium",
                  "flex items-center space-x-2",
                  !filterTab?.[filterTab.length - 1]?.current &&
                    "bg-primary text-white",
                )}
              >
                View & Apply
              </Button>
            </div>
          </div>
        </nav>
      </section>
      <div className="my-4">{selectedTab(selected)}</div>
    </div>
  );
}
