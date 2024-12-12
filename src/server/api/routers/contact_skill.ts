import { EOperator } from "@dna-platform/common-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { SkillDetailsSchema } from "~/server/zodSchema/contacts/skillDetails";
import { EStatus } from "../types";
interface ISkill {
  id: string;
  proficiency: string;
  years_of_experience: string;
  skill: string;
}
export const contactSkillRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const token = ctx.token.value;

      const advance_filters = createAdvancedFilter({
        contact_id: input.contact_id,
        status: EStatus.ACTIVE,
      });

      const response = await ctx.dnaClient
        .findAll({
          entity: "contact_skills",
          query: {
            advance_filters,
            pluck: ["id", "proficiency", "skill", "years_of_experience"],
            order: {
              limit: 100,
            },
          },
          token,
        })
        .execute();

      return response?.data;
    }),

  update: privateProcedure
    .input(
      SkillDetailsSchema.refine(
        (data) => {
          if (!data.skills.length || !data.contact_id) return false;
          const isValid = data.skills.every((skill: any) => {
            const { years_of_experience, skill: _skill } = skill || {};
            return years_of_experience && _skill;
          });

          return isValid;
        },
        {
          message:
            "Each skill must have non-empty years_of_experience and skill defined",
        },
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { contact_id, skills } = input;

      const modifyContactSkills = async (skill: ISkill) => {
        const { id, ...rest_skill } = skill || {};

        const get_skill = await ctx.dnaClient
          .findOne(id, {
            entity: "contact_skills",
            token: ctx.token.value,
            query: {
              pluck: ["id"],
            },
          })
          .execute();

        if (get_skill?.data?.length) {
          const skill_id = get_skill?.data?.[0]?.id;
          return await ctx.dnaClient
            .update(skill_id, {
              entity: "contact_skills",
              token,
              mutation: {
                params: rest_skill,
              },
            })
            .execute();
        }
        return await ctx.dnaClient
          .create({
            entity: "contact_skills",
            token,
            mutation: {
              params: {
                contact_id,
                ...skill,
              },
            },
          })
          .execute();
      };
      const skill = await Promise.allSettled(
        skills.map((item: any) => modifyContactSkills(item)),
      );
      const skill_ids: string[] = skill.map(
        (item: any) => item?.value?.data?.[0]?.id,
      );

      const not_used_skill = await ctx.dnaClient
        .findAll({
          entity: "contact_skills",
          token,
          query: {
            pluck: ["id"],
            advance_filters: [
              {
                type: "criteria",
                field: "id",
                operator: EOperator.NOT_CONTAINS,
                values: skill_ids,
              },
            ],
            order: {
              limit: 100,
            },
          },
        })
        .execute();

      if (not_used_skill?.data?.length) {
        const skills = not_used_skill?.data;
        skills.forEach((skill: any) => {
          ctx.dnaClient
            .update(skill?.id, {
              entity: "contact_skills",
              token,
              mutation: {
                params: {
                  status: EStatus.ARCHIVED,
                },
              },
            })
            .execute();
        });
      }

      return skill;
    }),
});
