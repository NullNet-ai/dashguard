"use client";

import { TStatus } from "./types";
import DeviceRemoteAccessGrid from '../../_components/forms/device-remote-access-grid';

const handleChangeStatus = async (
  status: TStatus,
  recordId: string,
  entityName: string,
  handleLoadingStateChange?: (itemName: string, isLoading: boolean) => void,
  sideDrawerActions?: any,
) => {
  console.log("🚀 ~ handleChangeStatus ~ recordId:", recordId)
  const label = status === 'remote_access' ? 'Remote Access' : status
  handleLoadingStateChange?.(label, true)
  try {
    sideDrawerActions?.openSideDrawer?.({
      sideDrawerWidth: '1000px',
      body: {
        component: DeviceRemoteAccessGrid,
        componentProps:   {
          deviceCode: recordId,
        },
      },
    })
  } catch (error) {
  }
  finally {
    handleLoadingStateChange?.(label, false)
  }
};

export { handleChangeStatus };
