import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";
import Bluebird from "bluebird";
import { EStatus } from "../types";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { PositionPostingsSchema } from "~/server/zodSchema/positions/positionPostings";

const entity = "position_posting";

export const positionPostingsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  update: privateProcedure
    .input(
      PositionPostingsSchema.extend({
        position_id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { position_id, postings } = input;
      const response = await Bluebird.map(postings, async (posting) => {
        const fetched_position_postings = await ctx.dnaClient
          // .findAll({
          //   entity: entity,
          //   token: ctx.token.value,
          //   query: {
          //     pluck: ["id", "status"],
          //     advance_filters: createAdvancedFilter({
          //       position_id: position_id,
          //       posting_site: posting?.posting_site || "",
          //       posting_link: posting?.posting_link || "",
          //     }),
          //     order: {
          //       limit: 1,
          //       by_field: "created_date",
          //       by_direction: EOrderDirection.DESC,
          //     },
          //   },
          // })
          .findOne(posting.id, {
            entity,
            token,
            query: {
              pluck: ["id"],
            },
          })
          .execute();

        if (fetched_position_postings?.data?.length) {
          const response = await ctx.dnaClient
            .update(fetched_position_postings?.data?.[0]?.id, {
              entity,
              token,
              mutation: {
                pluck: ["id"],
                params: {
                  ...posting,
                  position_id,
                },
              },
            })
            .execute();
          return response;
        }

        const response = await ctx.dnaClient
          .create({
            entity,
            token,
            mutation: {
              pluck: ["id"],
              params: {
                ...posting,
                position_id,
              },
            },
          })
          .execute();

        return response;
      });
      const position_posting_ids: string[] = response?.map(
        (item: any) => item?.data?.[0]?.id,
      );

      const removed_postings = await ctx.dnaClient
        .findAll({
          entity: entity,
          token,
          query: {
            pluck: ["id"],
            advance_filters: [
              {
                type: "criteria",
                field: "id",
                operator: EOperator.NOT_CONTAINS,
                values: position_posting_ids,
              },
              { type: "operator", operator: EOperator.AND },
              {
                type: "criteria",
                field: "position_id",
                operator: EOperator.EQUAL,
                values: [position_id!],
              },
            ],
            order: {
              limit: 100,
            },
          },
        })
        .execute();
      if (removed_postings?.data?.length) {
        const postings = removed_postings?.data;
        postings.forEach((posting: any) => {
          ctx.dnaClient
            .update(posting?.id, {
              entity: entity,
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
  getPostingsByPositionId: privateProcedure
    .input(
      z.object({
        position_id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.position_id) return null;
      const advance_filters = createAdvancedFilter({
        position_id: input.position_id,
        status: EStatus.ACTIVE,
      });
      const record = await ctx.dnaClient
        .findAll({
          entity,
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
