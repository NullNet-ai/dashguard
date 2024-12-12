import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AccountInformationSchema } from "~/server/zodSchema/contacts/accountInformation";

export const accountInformationRouter = createTRPCRouter({
  getById: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: "organization_contact_acounts",
          token: ctx.token.value,
          query: {
            pluck: ["id"],
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
    }),

  updateCredential: privateProcedure
    .input(AccountInformationSchema)
    .mutation(async ({ input, ctx }) => {
      const { contact_id = "", password = "", email } = input;

      const contact = await ctx.dnaClient
        .findOne(contact_id, {
          entity: "contacts",
          token: ctx.token.value,
          query: {
            pluck: ["first_name", "last_name"],
          },
        })
        .execute();

      const { first_name, last_name } = contact?.data?.[0] || {};

      const { name: org_name, id: org_id } = ctx.session.account.organization;

      const register = await ctx.dnaClient
        .register(
          {
            id: org_id,
            name: org_name,
          },
          {
            first_name: first_name || "John",
            last_name: last_name || "Doe",
            email,
            password,
          },
        )
        .execute();

      return register;
    }),
  getUser: privateProcedure.query(async ({ ctx }) => {
    const { first_name, last_name } = ctx.session.account.contact;

    const user_name =
      first_name || last_name ? `${first_name} ${last_name}` : "Farsheed Atef";
    const org_name = ctx.session.account.organization.name;

    return {
      user_name,
      org_name,
    };
  }),
});
