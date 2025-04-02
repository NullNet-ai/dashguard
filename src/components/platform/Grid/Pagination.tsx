'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid';
import { camelCase } from 'lodash';
import { useContext, useMemo, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { UpdateReportPagination } from './Action/UpdateReportPagination';
import { GridContext } from './Provider';
import { IPagination } from './types';
import PaginationSimpleCard from './Pagination/simple-card';
import PaginationCentered from './Pagination/centered';
import PaginationDefault from './Pagination/default';
export default function Pagination({ width: customWidth }: { width?: string | number,
  renderType?: 'default' | 'simple-card' | 'centered'
 }) {

  const { state } = useContext(GridContext);


  if(state?.config?.paginationType === 'simple-card'){
    return <PaginationSimpleCard />
  }

  else if(state?.config?.paginationType ==='centered') {
    return <PaginationCentered />
  }

  return <PaginationDefault />


}
