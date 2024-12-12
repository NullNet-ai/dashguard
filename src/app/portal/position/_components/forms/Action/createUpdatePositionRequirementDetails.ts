"use server";

import Bluebird from "bluebird";
import { ulid } from "ulid";
import { api } from "~/trpc/server";

interface IProps {
  id?: string;
  position_id?: string;
  requirement_type_id?: string;
  requirement_type?: string;
  requirement_description?: string;
}

export interface IData {
  id: string;
  requirements: IProps[];
}
interface IPositionDescriptionDetails {
  id: string;
  description?: string;
  responsibility?: string;
}
export const createPositionRequirementDetails = async (data: IData) => {
  const { requirements, id } = data ?? {};
  const fetch_all_requirement_details: any =
    await api.positionRequirement.fetchRequirementsDetails({
      pluck: [
        "id",
        "requirement_type_id",
        "position_id",
        "requirement_description",
      ],
    });

  await Bluebird.map(requirements, async (item) => {
    const { requirement_type, requirement_description } = item ?? {};

    const existing_position_requirement_details =
      fetch_all_requirement_details?.find(
        (item: IProps) => item?.requirement_type_id === requirement_type,
      );

    if (!!existing_position_requirement_details) {
      return await api.positionRequirement.updateRequirements({
        id: existing_position_requirement_details.id ?? "",
        requirement_description: requirement_description ?? "",
        requirement_type_id: requirement_type ?? "",
      });
    } else {
      return await api.positionRequirement.createRequirements({
        id,
        requirement_description: requirement_description ?? "",
        requirement_type_id: requirement_type ?? "",
      });
    }
  });

  await Bluebird?.map(
    fetch_all_requirement_details,
    async (existing_position_requirements: IProps) => {
      const existing_requirement = requirements.find(
        (item) =>
          item.requirement_type ===
            existing_position_requirements?.requirement_type_id &&
          id === existing_position_requirements?.position_id,
      );
      if (!existing_requirement) {
        await api.positionRequirement.delete({
          id: existing_position_requirements.id ?? "",
        });
      }
    },
  );
};

export const fetchReqByPositionIdDetails = async (id: string) => {
  const fetched_requirement_details =
    await api.positionRequirement.fetchRequirementsByPositionIdDetails({
      id,
      pluck: ["id", "requirement_type_id", "requirement_description"],
    });

  const default_requirements_details = fetched_requirement_details?.length
    ? fetched_requirement_details?.map((item) => ({
        id: item.id,
        requirement_type: item.requirement_type_id,
        requirement_description: item.requirement_description,
      }))
    : [
        {
          id: ulid(),
          requirement_type: "",
          requirement_description: "",
        },
      ];

  return default_requirements_details;
};

export const updatePositionDescriptionDetails = async (
  data: IPositionDescriptionDetails,
) => {
  return await api?.position?.updatePositionDescription(data);
};
