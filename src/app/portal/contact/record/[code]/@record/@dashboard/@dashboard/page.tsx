'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Link2, Wrench } from 'lucide-react';
import Image from 'next/image';

import Grid from '~/components/platform/Grid/Client';
import { cn } from '~/lib/utils';

const RecordTabContainer = () => {
  const gridColumns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Header Cell',
      accessorKey: 'header-cell',
      cell: ({ row }: any) => {
        const headerCell = row?.original?.['header-cell'];
        const { value, type = 'text', color = 'red' } = headerCell || {};

        const colorMap = {
          red: 'bg-red-100 text-red-600',
          blue: 'bg-blue-100 text-blue-600',
          green: 'bg-green-100 text-green-600',
          yellow: 'bg-yellow-100 text-yellow-600',
        };

        const renderContent = () => {
          if (type === 'image') {
            return <Image src={value} alt={value} width={5} height={5} className="h-6 w-6 object-cover" />;
          }
          return value;
        };

        return (
          <div className={cn(
            'flex h-8 w-16 items-center justify-center rounded font-semibold', colorMap[color as keyof typeof colorMap] || colorMap.red
          )}
          >
            {renderContent()}
          </div>
        );
      },
    },
    {
      header: 'Label',
      accessorKey: 'label',
    },
    {
      header: 'Pages',
      accessorKey: 'pages',
    },
    {
      header: 'Issues',
      accessorKey: 'issues',
    },
    {
      header: 'For Review',
      accessorKey: 'review',
      isSearchable: false,
    },
    {
      header: 'Fix',
      accessorKey: 'fix',
    },
    {
      header: 'Content',
      accessorKey: 'content',
      cell: () => {
        return (
          <div className="flex flex-col gap-6 p-4 pl-10">
            <div className="flex items-start gap-4">
              <code className="block w-full rounded bg-slate-900 p-4 font-mono text-sm text-slate-100">
                This is sample Code here
              </code>
            </div>
            <div className="flex items-start gap-4">
              <code className="block w-full rounded bg-slate-900 p-4 font-mono text-sm text-slate-100">
                123123
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4" />
              <span>
                Ensure that all SVG or Image elements that are added as markup
                into the HTML, have a valid label that are used to provide an
                accessible name for the SVG or image elements.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <Link2 className="h-4 w-4" />
              <a
                href="https://www.grandcentralartcenter.com/category/past/page/37/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.grandcentralartcenter.com/category/past/page/37/
              </a>
            </div>
          </div>
        );
      },
    },
  ] as ColumnDef<any>[];

  const dummdata = [
    {
      'id': 1,
      'label': '1.1.1 Non Text Only',
      'pages': 10,
      'issues': 2,
      'header-cell': {
        value: 'BB',
        type: 'text',
        color: 'red',
      },
      'review': 1,
      'fix': 'Eee',
    },
    {
      'id': 1,
      'label': '1.2.2 Non Text Blue',
      'pages': 10,
      'issues': 2,
      'header-cell': {
        value: 'CC',
        type: 'text',
        color: 'blue',
      },
      'review': 1,
      'fix': 'Eee',
    },
    {
      'id': 2,
      'label': '1.1.1 This is image sample',
      'pages': 10,
      'issues': 2,
      'header-cell': {
        value: '/tailwindLogo.svg',
        type: 'image',
        color: 'blue',
      },
      'review': 0,
      'fix': 'Auto',
    },
  ];

  return (
    <Grid
      totalCount={dummdata.length || 0}
      data={dummdata}
      defaultSorting={[]}
      defaultAdvanceFilter={[]}
      advanceFilter={[]}
      sorting={[]}
      hideSearch={false}
      gridType="card-list"
      config={{
        entity: 'contact',
        title: 'Card List',
        columns: gridColumns,
        enableAutoCreate: false,
        expandTriggerPosition: 'right',
        searchConfig: {
          router: 'contact',
          resolver: 'mainGrid',
          query_params: {
            entity: 'contact',
          },
        },
      }}
    />
  );
};

export default RecordTabContainer;
