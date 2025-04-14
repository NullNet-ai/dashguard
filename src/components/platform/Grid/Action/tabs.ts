'use server'

import { api } from '~/trpc/server';

export const getGridTabs = async ({gridKey}: {
   gridKey?: string;
}) => {
   const gridData = await api.grid.getSessionGridTabs({ gridKey });
   return gridData;

}