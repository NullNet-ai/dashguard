// import React, { Fragment } from "react";
// import * as HERO_ICON from "@heroicons/react/20/solid";
// import { Input } from "~/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
// import { Badge } from "~/components/ui/badge";
// import { Separator } from "~/components/ui/separator";

// const { MagnifyingGlassIcon } = HERO_ICON;
// export default function Search() {
//   return (
// <Fragment>
//   <MagnifyingGlassIcon className="sm:hidden h-7 w-7 text-muted-foreground" />
//    <div className={`hidden w-full md:w-[400px] ms-3 lg:ms-0 mr-2 h-5/6 sm:flex items-center pb-1 flex-grow sm:flex-grow-0`}>
//      <Input
//       type="search"
//       placeholder="Search..."
//       Icon={MagnifyingGlassIcon}
//       iconPlacement="left"
//       className=" w-full flex-grow rounded-md border-none pl-10 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0 bg-secondary"
//            />
//    </div>
// </Fragment>
//   );
// }

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  DocumentPlusIcon,
  FolderIcon,
  FolderPlusIcon,
  HashtagIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { Button } from "~/components/ui/button";

const projects = [
  { id: 1, name: "Workflow Inc. / Website Redesign", url: "#" },
  // More projects...
] as {
  id: number;
  name: string;
  url: string;
}[];
const recent = [projects[0]];
const quickActions = [
  { name: "Add new file...", icon: DocumentPlusIcon, shortcut: "N", url: "#" },
  { name: "Add new folder...", icon: FolderPlusIcon, shortcut: "F", url: "#" },
  { name: "Add hashtag...", icon: HashtagIcon, shortcut: "H", url: "#" },
  { name: "Add label...", icon: TagIcon, shortcut: "L", url: "#" },
];

export default function Example() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredProjects =
    query === ""
      ? []
      : projects.filter((project) => {
          return project.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Fragment>
      <Button
        onClick={() => {
          handleOpen();
        }}
        type="button"
        size={"icon"}
        variant={"ghost"}
      >
        <MagnifyingGlassIcon className="h-6 w-6 text-muted-foreground" />
      </Button>
      <Dialog
        className="relative z-50"
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0  bg-gray-500/25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
          <DialogPanel
            transition
            className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <Combobox>
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-4 top-3.5 size-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  autoFocus
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  onChange={(event) => setQuery(event.target.value)}
                  onBlur={() => setQuery("")}
                />
              </div>

              {(query === "" || filteredProjects.length > 0) && (
                <ComboboxOptions
                  static
                  as="ul"
                  className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                >
                  <li className="p-2">
                    {query === "" && (
                      <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
                        Recent searches
                      </h2>
                    )}
                    <ul className="text-sm text-gray-700">
                      {(query === "" ? recent : filteredProjects)?.map(
                        (project) => (
                          <ComboboxOption
                            as="li"
                            key={project?.id}
                            value={project}
                            className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                          >
                            <FolderIcon
                              className="size-6 flex-none text-gray-400 group-data-[focus]:text-white group-data-[focus]:forced-colors:text-[Highlight]"
                              aria-hidden="true"
                            />
                            <span className="ml-3 flex-auto truncate">
                              {project?.name}
                            </span>
                            <span className="ml-3 hidden flex-none text-indigo-100 group-data-[focus]:inline">
                              Jump to...
                            </span>
                          </ComboboxOption>
                        ),
                      )}
                    </ul>
                  </li>
                  {query === "" && (
                    <li className="p-2">
                      <h2 className="sr-only">Quick actions</h2>
                      <ul className="text-sm text-gray-700">
                        {quickActions.map((action) => (
                          <ComboboxOption
                            as="li"
                            key={action.shortcut}
                            value={action}
                            className="group flex cursor-default select-none items-center rounded-md px-3 py-2 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                          >
                            <action.icon
                              className="size-6 flex-none text-gray-400 group-data-[focus]:text-white group-data-[focus]:forced-colors:text-[Highlight]"
                              aria-hidden="true"
                            />
                            <span className="ml-3 flex-auto truncate">
                              {action.name}
                            </span>
                            <span className="ml-3 flex-none text-xs font-semibold text-gray-400 group-data-[focus]:text-indigo-100">
                              <kbd className="font-sans">⌘</kbd>
                              <kbd className="font-sans">{action.shortcut}</kbd>
                            </span>
                          </ComboboxOption>
                        ))}
                      </ul>
                    </li>
                  )}
                </ComboboxOptions>
              )}

              {query !== "" && filteredProjects.length === 0 && (
                <div className="px-6 py-14 text-center sm:px-14">
                  <FolderIcon
                    className="mx-auto size-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-sm text-gray-900">
                    We couldn't find any projects with that term. Please try
                    again.
                  </p>
                </div>
              )}
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>
    </Fragment>
  );
}
