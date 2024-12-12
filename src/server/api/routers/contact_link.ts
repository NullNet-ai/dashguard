import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { LinkSchema } from "../../zodSchema/contacts/linkDetails";
import { createDefineRoutes } from "../baseCrud";

const entity = "contact_link";
export const contactLinkRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  saveLinks: privateProcedure
    .input(z.object({ links: z.array(LinkSchema), contact_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { links = [], contact_id } = input;

      if (!links.length) return true;

      const updated_ids: string[] = [];

      const getLinksByContactId = async (contact_id: string) => {
        const advance_filters = createAdvancedFilter({
          contact_id,
          status: "Active",
        });

        const response = await ctx.dnaClient
          .findAll({
            entity,
            query: {
              advance_filters,
              pluck: ["id", "title", "link"],
            },
            token,
          })
          .execute();

        return response?.data || [];
      };

      // Fetch existing links for the contact
      const existing_links = await getLinksByContactId(contact_id);

      // Process each link: update existing or create new
      for (const link of links) {
        const existing = existing_links.find(
          (existing_link) => existing_link.id === link.id,
        );

        const { id: link_id, title, link: _input_link } = link;

        if (existing) {
          // Update the existing link
          await ctx.dnaClient
            .update(link_id, {
              entity,
              token,
              mutation: {
                params: {
                  title,
                  link: _input_link,
                  contact_id,
                  status: "Active",
                },
                pluck: ["id"],
              },
            })
            .execute();

          updated_ids.push(existing.id);
        } else {
          // Create a new link
          const response = await ctx.dnaClient
            .create({
              entity,
              token,
              mutation: {
                params: {
                  id: link_id!,
                  title,
                  link: _input_link,
                  contact_id,
                  status: "Active",
                },
                pluck: ["id"],
              },
            })
            .execute();

          const { data } = response;
          const [_link] = data;
          if (_link?.id) {
            updated_ids.push(_link.id);
          }
        }
      }

      // Archive links that are no longer present in the updated links
      for (const link of existing_links) {
        if (!updated_ids.includes(link.id)) {
          await ctx.dnaClient
            .update(link.id, {
              entity,
              token,
              mutation: {
                params: {
                  tombstone: 1,
                  status: "Archived",
                },
                pluck: ["id"],
              },
            })
            .execute();
        }
      }

      // Return whether there are valid updated IDs
      return !!updated_ids.filter(Boolean).length;
    }),
  getLinksByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const token = ctx.token.value;

      const advance_filters = createAdvancedFilter({
        contact_id: input.contact_id,
        status: "Active",
      });

      const response = await ctx.dnaClient
        .findAll({
          entity,
          query: {
            advance_filters,
            pluck: ["id", "title", "link"],
          },
          token,
        })
        .execute();

      return response?.data || [];
    }),
});
