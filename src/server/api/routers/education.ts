import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";
import { EducationDetailsSchema } from "~/server/zodSchema/contacts/educationDetails";
import Bluebird from "bluebird";
import { EStatus } from "../types";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const educationRouter = createTRPCRouter({
  ...createDefineRoutes("educations"),
  update: privateProcedure
    .input(
      EducationDetailsSchema.extend({
        contact_id: z.string().min(1),
      }).refine(
        (data) => {
          if (!data.educations.length || !data.contact_id) return false;
          return true;
        },
        {
          message:
            "There should at least be one education and each education should have a contact_id.",
        },
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { contact_id, educations } = input;
      const response = await Bluebird.map(educations, async (education) => {
        const fetched_education = await ctx.dnaClient
          .findOne(education.id, {
            entity: "educations",
            token,
            query: {
              pluck: ["id"],
            },
          })
          .execute();

        if (fetched_education?.data?.length) {
          const response = await ctx.dnaClient
            .update(education.id, {
              entity: "educations",
              token,
              mutation: {
                pluck: ["id"],
                params: {
                  ...education,
                  contact_id,
                },
              },
            })
            .execute();
          return response;
        }

        const response = await ctx.dnaClient
          .create({
            entity: "educations",
            token,
            mutation: {
              pluck: ["id"],
              params: {
                ...education,
                contact_id,
              },
            },
          })
          .execute();

        return response;
      });
      const education_ids: string[] = response?.map(
        (item: any) => item?.data?.[0]?.id,
      );

      const removed_educations = await ctx.dnaClient
        .findAll({
          entity: "educations",
          token,
          query: {
            pluck: ["id"],
            advance_filters: [
              {
                type: "criteria",
                field: "id",
                operator: EOperator.NOT_CONTAINS,
                values: education_ids,
              },
              { type: "operator", operator: EOperator.AND },
              {
                type: "criteria",
                field: "contact_id",
                operator: EOperator.EQUAL,
                values: [contact_id!],
              },
            ],
            order: {
              limit: 100,
            },
          },
        })
        .execute();
      if (removed_educations?.data?.length) {
        const educations = removed_educations?.data;
        educations.forEach((education: any) => {
          ctx.dnaClient
            .update(education?.id, {
              entity: "educations",
              token,
              mutation: {
                pluck: ["id", "status"],
                params: {
                  status: EStatus.ARCHIVED,
                },
              },
            })
            .execute();
        });
      }

      return response;
    }),
  getEducationByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.contact_id) return null;
      const advance_filters = createAdvancedFilter({
        contact_id: input.contact_id,
        status: EStatus.ACTIVE,
      });
      const record = await ctx.dnaClient
        .findAll({
          entity: "educations",
          token: ctx.token.value,
          query: {
            advance_filters,
            order: {
              starts_at: 0,
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return record?.data || [];
    }),
});
