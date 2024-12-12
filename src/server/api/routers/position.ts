import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { LogisticsSchema } from "~/server/zodSchema/positions/logistics";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";
import { currencies } from "~/server/utils/currency";
import { CompensationsSchema } from "~/server/zodSchema/positions/compensations";
import { PositionBasicDetailsSchema } from "../../zodSchema/positions/basicDetails";

export const positionsRouter = createTRPCRouter({
  ...createDefineRoutes("position"),
  getById: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, pluck = ["id"] } = input;
      const record = await ctx.dnaClient
        .findOne(id, {
          entity: "position",
          token: ctx.token.value,
          query: {
            pluck,
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  updateLogistics: privateProcedure
    .input(
      LogisticsSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, company_id, department_id, team_id, report_to = [] } = input;

      const position = await ctx.dnaClient
        .update(id, {
          entity: "position",
          token: ctx.token.value,
          mutation: {
            params: {
              company_id,
              department_id,
              team_id,
            },
          },
        })
        .execute();

      const current_report_contact_ids = report_to.map(
        (report) => report.value,
      );

      const existing_reports = await ctx.dnaClient
        .findAll({
          entity: "position_reports_to_contacts",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "position_id",
                operator: EOperator.CONTAINS,
                values: [id],
              },
            ],
            order: {
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
            pluck: ["contact_id", "id"],
          },
        })
        .execute();

      const existing_report_ids = existing_reports.data.map(
        (report) => report.contact_id,
      );

      const not_existing_reports = current_report_contact_ids.filter(
        (report) => !existing_report_ids.includes(report),
      );

      const archivedreports = existing_reports?.data.filter(
        (report) => !current_report_contact_ids.includes(report.contact_id),
      );

      await Promise.allSettled([
        ...(not_existing_reports.length
          ? [
              ...not_existing_reports.map(
                async (report) =>
                  await ctx.dnaClient
                    .create({
                      entity: "position_reports_to_contacts",
                      token: ctx.token.value,
                      mutation: {
                        params: {
                          contact_id: report,
                          position_id: id,
                        },
                      },
                    })
                    .execute(),
              ),
            ]
          : []),
        ...(archivedreports.length
          ? [
              ...archivedreports.map(
                async (report) =>
                  await ctx.dnaClient
                    .update(report.id, {
                      entity: "position_reports_to_contacts",
                      token: ctx.token.value,
                      mutation: {
                        params: {
                          tombstone: 1,
                          status: "Archived",
                        },
                      },
                    })
                    .execute(),
              ),
            ]
          : []),
      ]);

      return position;
    }),
  updateCompensation: privateProcedure
    .input(
      CompensationsSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const { minimum_salary, maximum_salary } = rest;
      if (minimum_salary && maximum_salary) {
        if (minimum_salary > maximum_salary) {
          return {
            message: "Minimum salary should be less than maximum.",
            data: [],
            status_code: 409,
            total_count: 0,
            record_count: 0,
            errors: {
              form: [
                {
                  field: "minimum_salary",
                  message: "Minimum salary should be less than maximum.",
                },
              ],
            },
          };
        }
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "position",
          token: ctx.token.value,
          mutation: {
            params: rest,
          },
        })
        .execute();

      return res;
    }),

  getDropdowns: privateProcedure
    .input(
      z.object({
        entity: z.string().min(1),
        label_field: z.string().min(1),
        filter: z
          .object({
            status: z.string().optional(),
          })
          .optional(),
        pluck: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        entity,
        label_field,
        filter = { status: "Active" },
        pluck = ["id"],
      } = input;
      const advance_filters = createAdvancedFilter(filter);

      const response = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters,
            order: {
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      const transformD = response.data.map((item) => {
        return {
          value: item.id,
          label: item?.[label_field],
        };
      });
      return transformD;
    }),
  getCurrency: privateProcedure.query(async () => {
    const currency = Object.entries(currencies).map(([key]) => ({
      value: key,
      label: key,
    }));
    return currency;
  }),
  updateBasicDetails: privateProcedure
    .input(
      PositionBasicDetailsSchema.extend({
        id: z.string({ message: "Position ID is required." }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;

      const existing_position = await ctx.dnaClient
        .findAll({
          entity: "position",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              title: input?.title || "",
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      const [_existing_position] = existing_position?.data || [];

      if (_existing_position && _existing_position?.id !== input.id) {
        return {
          success: false,
          message: "Position already exists.",
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          errors: {
            form: [
              {
                field: "title",
                message: "Position already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(id, {
          entity: "position",
          token: ctx.token.value,
          mutation: {
            params: rest,
          },
        })
        .execute();

      return res;
    }),

  updatePositionDescription: privateProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().nullable().optional(),
        responsibility: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: "position",
          token: ctx.token.value,
          mutation: {
            params: input,
          },
        })
        .execute();

      return res;
    }),
  filterRepostTo: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const existing_reports = await ctx.dnaClient
        .findAll({
          entity: "position_reports_to_contact",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "position_id",
                operator: EOperator.CONTAINS,
                values: [id],
              },
            ],
            order: {
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
            pluck: ["contact_id", "id"],
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact",
              field: "id",
            },
            from: {
              entity: "position_reports_to_contact",
              field: "contact_id",
            },
          },
        })
        .execute();

      const contacts = existing_reports?.data.map(({ contacts }) => ({
        value: contacts.id,
        label: `${contacts.first_name} ${contacts.last_name}`,
      }));

      return contacts;
    }),
  updatePositionsWithTags: privateProcedure
    .input(z.object({ id: z.string(), tags: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { tags } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: "position",
          token: ctx.token.value,
          mutation: {
            params: {
              tags,
            },
          },
        })
        .execute();
    }),
});
