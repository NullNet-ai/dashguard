'use client';

import Filter from '../../timeline/Filter';
import Search from '../../timeline/Search';
import { IFormProps } from '../../types';

import MapComponent from './components/MapComponent';

export default function TrafficMaps({ params}: IFormProps) {
  return (
    <div>
      <Filter />
      <Search  params={{...params, router: 'packet', resolver: 'filterPackets' }} />
      <h1>Traffic Flow to Philippines Server</h1>
      <MapComponent />

    </div>
  );
}