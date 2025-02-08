'use client';

import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { FolderIcon } from '@heroicons/react/24/outline';
import { SearchIcon } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '~/components/ui/button';

const projects = [
  { id: 1, name: 'Workflow Inc. / Website Redesign', url: '#' },
  // More projects...
] as {
  id: number;
  name: string;
  url: string;
}[];

export default function SearchDialog() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredProjects =
    query === ''
      ? []
      : projects.filter((project) => {
          return project.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="softPrimary"
        className="mb-2 gap-x-2"
        size="md"
        onClick={() => {
          handleOpen();
        }}
      >
        <SearchIcon className="size-4" />
        <span className="mr-1">Search</span>
      </Button>

      <Dialog
        className="relative z-50"
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
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
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  onChange={(event) => setQuery(event.target.value)}
                  onBlur={() => setQuery('')}
                />
              </div>

              {(query === '' || filteredProjects.length > 0) && (
                <ComboboxOptions
                  static
                  as="ul"
                  className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                >
                  <li className="p-2">
                    {query === '' && (
                      <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
                        Recent searches
                      </h2>
                    )}
                  </li>
                </ComboboxOptions>
              )}

              {query !== '' && filteredProjects.length === 0 && (
                <div className="px-6 py-14 text-center sm:px-14">
                  <FolderIcon
                    className="mx-auto size-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-sm text-gray-900">
                    We could not find any projects with that term. Please try
                    again.
                  </p>
                </div>
              )}
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
