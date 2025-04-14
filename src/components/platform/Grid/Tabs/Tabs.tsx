'use client';

import GridTabLists from './_components/GridTablists';
import { useEffect, useState } from 'react';
import { getGridTabs } from '../Action/tabs';
import { Loader } from '~/components/ui/loader';
interface IProps {
  gridKey?: string;
}

const GridTabs = ({ gridKey }: IProps) => {
  const [tabs, setTabs] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGridTabs = async () => {
      const data = await getGridTabs({
        gridKey: gridKey!,
      });

      setIsLoading(false);
      setTabs(data);
    };
    fetchGridTabs();
  }, [gridKey]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center pl-3">
        <Loader
          className="bg-primary text-default"
          label=""
          size="sm"
          variant="spinner"
        />
      </div>
    );
  }

  return <GridTabLists tabs={tabs} />;
};

export default GridTabs;
