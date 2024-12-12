"use server";

import Bluebird from "bluebird";
import { ulid } from "ulid";
import { api } from "~/trpc/server";

interface IProps {
  id?: string;
  contact_id?: string;
  full_name?: string;
  assignment?: string;
  booking_id?: string;
}

export interface IData {
  id: string;
  participants: IProps[];
}

export const createParticipantsDetails = async (data: IData) => {
  const { participants, id } = data ?? {};
  const fetch_existing_participants: any =
    await api.bookingParticipant.getParticipantsByBookingId({
      booking_id: id,
      pluck_fields: ["id", "contact_id", "booking_id", "assignment"],
    });

  await Bluebird.map(participants, async (item) => {
    const { full_name, assignment } = item ?? {};

    const existing_position_requirement_details =
      fetch_existing_participants?.find(
        (item: IProps) => item?.contact_id === full_name,
      );

    if (!!existing_position_requirement_details) {
      return await api.bookingParticipant.updateBookingParticipantsRecord({
        id: existing_position_requirement_details.id ?? "",
        contact_id: full_name ?? "",
        assignment: assignment ?? "",
        booking_id: id,
      });
    } else {
      return await api.bookingParticipant.createBookingParticipantsRecord({
        booking_id: id,
        assignment,
        contact_id: full_name,
      });
    }
  });

  await Bluebird?.map(
    fetch_existing_participants,
    async (existing_participants: IProps) => {
      const existing_participant = participants.find(
        (item) =>
          item.full_name === existing_participants?.contact_id &&
          id === existing_participants?.booking_id,
      );
      if (!existing_participant) {
        await api.bookingParticipant.delete({
          id: existing_participants.id ?? "",
        });
      }
    },
  );
};

export const fetchParticipants = async (id: string) => {
  const fetched_participants =
    await api.bookingParticipant.getParticipantsByBookingId({
      booking_id: id,
      pluck_fields: ["id", "assignment", "contact_id"],
    });

  const default_participants = fetched_participants?.length
    ? fetched_participants?.map((item) => {
        const { id, contact_id, assignment } = (item || {}) as Record<
          string,
          string
        >;
        return {
          id,
          full_name: contact_id,
          assignment: assignment,
        };
      })
    : [
        {
          id: ulid(),
          full_name: "",
          assignment: "",
        },
      ];

  return default_participants;
};
