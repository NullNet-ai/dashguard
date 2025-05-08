'use client';

import GridTabLists from './_components/GridTablists';
import { useEffect, useState } from 'react';
import { getGridTabs } from '../Action/tabs';
import { Loader } from '~/components/ui/loader';
interface IProps {
  gridKey?: string;
  grid_tabs?: any[];
}

const GridTabs = ({ gridKey, grid_tabs }: IProps) => {
  // const [tabs, setTabs] = useState<any>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  // console.log("🚀 ~ GridTabs ~ isLoading:", isLoading)

  // useEffect(() => {
    
  //   const fetchGridTabs = async () => {
  //     const startTime = performance.now();
  //     const data = await getGridTabs({
  //       gridKey: gridKey!,
  //     });
  //     const endTime = performance.now();
  //     const elapsedTime = endTime - startTime;
  //     console.log("🚀 ~ fetchGridTabs ~ data:", data);
  //     console.log(`🚀 ~ fetchGridTabs ~ elapsed time: ${elapsedTime.toFixed(2)}ms`);

  //     setIsLoading(false);
  //     setTabs(data);
  //   };
  //   fetchGridTabs();
  // }, []);

  // if (isLoading) {
  //   return (
  //     <div className="flex h-full items-center pl-3">
  //       <Loader
  //         className="bg-primary text-default"
  //         label=""
  //         size="sm"
  //         variant="spinner"
  //       />
  //     </div>
  //   );
  // }

  return <GridTabLists tabs={grid_tabs ?? []} />;
};

export default GridTabs;
