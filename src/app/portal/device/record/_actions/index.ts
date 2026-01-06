"use client";

import { TStatus } from "./types";
import SelectExistingRemoteAccess from '../../_components/forms/select-existing-remote-access'

const handleChangeStatus = (
  status: TStatus,
  recordId: string,
  entityName: string,
  handleLoadingStateChange?: (itemName: string, isLoading: boolean) => void,
  sideDrawerActions?: any,
) => {
  const label = status === 'remote_access' ? 'Remote Access' : status
  handleLoadingStateChange?.(label, true)
  try {
    sideDrawerActions?.openSideDrawer?.({
      sideDrawerWidth: '500px',
      body: {
        component: SelectExistingRemoteAccess,
        componentProps: {
          record_data: {
            code: recordId,
          },
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
