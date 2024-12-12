"use server";

import Bluebird from "bluebird";
import { api } from "~/trpc/server";

interface IProps {
  id: string;
  work_setup: {
    value: string;
    label: string;
  }[];
  locations: {
    value: string;
    label: string;
  }[];
  exceptions?: {
    value: string;
    label: string;
  }[];
}

export const createPositionWorkSetupDetails = async (data: IProps) => {
  const { id, work_setup = [], locations = [] } = data ?? {};

  const existing_position_work_setup_details =
    await api.positionWorkSetup.fetchWorkSetupDetails({
      id,
    });

  work_setup.map(async (item) => {
    const existing_details = existing_position_work_setup_details.find(
      (existing_position) =>
        existing_position?.position_work_setups?.work_setup_id === item.value &&
        existing_position?.position_work_setups?.position_id === id,
    );

    if (
      existing_details &&
      !!Object?.keys(existing_details?.position_work_setups).length
    ) {
      await api.positionWorkSetup.updateWorkSetup({
        id: existing_details?.position_work_setups?.id,
        work_setup_id: item.value,
        countries: locations?.map((item) => item?.label),
      });
    } else {
      await Bluebird?.map(work_setup, async (item) => {
        const { value: work_setup_id } = item;
        return await api.positionWorkSetup.createWorkSetup({
          id,
          work_setup_id,
          countries: locations?.map((item) => item?.label),
        });
      });
    }
  });

  existing_position_work_setup_details.map(async (existing_position) => {
    const existing_work_setup = work_setup.find(
      (item) =>
        item.value === existing_position?.position_work_setups?.work_setup_id &&
        existing_position?.position_work_setups?.position_id === id,
    );

    if (!existing_work_setup) {
      await api.positionWorkSetup.delete({
        id: existing_position?.position_work_setups?.id,
      });
    }
  });

  return existing_position_work_setup_details;
};

export const fetchWorkSetup = async (id: string) => {
  const fetched_work_setup = await api.positionWorkSetup.fetchWorkSetupDetails({
    id,
  });

  const work_setup_ids = [
    ...new Set(
      fetched_work_setup.map((item) => item.position_work_setups.work_setup_id),
    ),
  ];
  const countries = [
    ...new Set(
      fetched_work_setup.flatMap((item) => item.position_work_setups.countries),
    ),
  ];

  const default_values = {
    work_setup: work_setup_ids.map((id) => {
      const work_setup = fetched_work_setup?.find(
        (item) => item.position_work_setups.work_setup_id === id,
      )?.work_setups;
      return {
        label: work_setup?.work_setup,
        value: id,
      };
    }),
    locations: countries.map((country) => ({
      label: country,
      value: country,
    })),
  };

  return default_values;
};
