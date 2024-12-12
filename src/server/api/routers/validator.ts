import Bluebird from "bluebird";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { EOperator, type IAdvanceFilters } from "@dna-platform/common-orm";
import {
  EmailArraySchema,
  EmailSchema,
  PhoneArraySchema,
  PhoneSchemaValidation,
} from "~/server/zodSchema/contact/contactPhoneEmail";

export const validatorRouter = createTRPCRouter({
  validatePhoneAndEmail: privateProcedure
    .input(
      z.object({
        primary_phone: PhoneSchemaValidation,
        primary_email: EmailSchema,
        contact_id: z.string(),
        phones: z.array(PhoneSchemaValidation),
        emails: z.array(EmailSchema),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { emails, phones, contact_id } = input;

      const fetchContactData = async (
        entity: string,
        filters: IAdvanceFilters[],
        pluckFields: string[],
      ) => {
        const response = await ctx.dnaClient
          .findAll({
            entity,
            token: ctx.token.value,
            query: {
              advance_filters: filters,
              pluck: pluckFields,
            },
          })
          .execute();

        return response?.data?.length
          ? response.data.reduce((acc, item) => ({ ...acc, ...item }), {})
          : null;
      };

      const getContactData = async (
        items:
          | z.infer<typeof PhoneArraySchema>
          | z.infer<typeof EmailArraySchema>,

        entity: string,
        fieldKey: string,
        pluckFields: string[],
      ) => {
        return Promise.all(
          items?.map((item) => {
            const field_value = (item as { [key: string]: any })?.[fieldKey];

            if (!field_value) return null;

            const filters = [
              ...createAdvancedFilter({
                [fieldKey]: field_value,
                status: "Active",
              }),
              {
                operator: EOperator.AND,
                type: "operator",
              },
              {
                field: "contact_id",
                operator: EOperator.NOT_EQUAL,
                type: "criteria",
                values: [contact_id],
              },
            ];

            return fetchContactData(entity, filters, pluckFields);
          }),
        );
      };

      const [phones_exist, email_exist] = await Bluebird.all([
        getContactData(phones, "contact_phone_numbers", "raw_phone_number", [
          "id",
          "raw_phone_number",
          "is_primary",
          "contact_id",
          "country_code",
          "iso_code",
        ]),
        getContactData(emails, "contact_emails", "email", [
          "id",
          "email",
          "is_primary",
          "contact_id",
        ]),
      ]);

      const _phones = phones_exist?.filter(Boolean);
      const _emails = email_exist?.filter(Boolean);

      if (!_emails?.length && !_phones?.length) {
        return {
          message: "",
          data: [],
          status_code: 200,
          total_count: 0,
          record_count: 0,
          existing: false,
        };
      }

      return {
        message: "",
        data: [
          {
            phones: phones_exist?.map((item) => item?.id),
            emails: email_exist?.map((item) => item?.id),
          },
        ],
        status_code: 200,
        total_count: 0,
        record_count: 0,
        existing: true,
      };
    }),
});
