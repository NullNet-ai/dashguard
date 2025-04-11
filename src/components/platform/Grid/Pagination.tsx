'use client';

import { useContext } from 'react';


import PaginationCentered from './Pagination/centered';
import PaginationDefault from './Pagination/default';
import PaginationSimpleCard from './Pagination/simple-card';
import { GridContext } from './Provider';
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
