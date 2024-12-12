import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { pick } from "lodash";
import { DocumentDetailsSchema } from "../../zodSchema/contacts/documentDetails";

const entity = "contact_file";

export const contactFileRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  saveFiles: privateProcedure
    .input(
      DocumentDetailsSchema.extend({
        contact_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { file_ids = [], contact_id } = input;

      if (!file_ids.length) return true;

      const updated_ids: string[] = [];

      const getFileByContactId = async (contact_id: string) => {
        const advance_filters = createAdvancedFilter({
          contact_id,
          status: "Active",
        });

        const response = await ctx.dnaClient
          .findAll({
            entity,
            query: {
              advance_filters,
              pluck: ["id", "file_id", "contact_id"],
            },
            token,
          })
          .execute();

        return response?.data || [];
      };

      // Fetch existing files for the contact
      const existing_files = await getFileByContactId(contact_id);

      // Process each file: update existing or create new
      for (const file of file_ids) {
        const existing = existing_files.find(
          (existing_file) => existing_file.id === file,
        );

        const file_id = file! as string;

        if (existing) {
          updated_ids.push(file_id);
        } else {
          // Create a new file
          const response = await ctx.dnaClient
            .create({
              entity,
              token,
              mutation: {
                params: {
                  file_id,
                  contact_id,
                  status: "Active",
                },
                pluck: ["id"],
              },
            })
            .execute();

          const { data } = response;
          const [_file] = data;
          if (_file?.id) {
            updated_ids.push(_file.id);
          }
        }
      }

      // Archive files that are no longer present in the updated files
      for (const file of existing_files) {
        if (!updated_ids.includes(file.id)) {
          await ctx.dnaClient
            .update(file.id, {
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
  getContactFilesWithRelatedFileById: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {} } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        contact_id: input.contact_id,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: entity,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: input.pluck_fields,
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "files",
              field: "id",
            },
            from: {
              entity: "contact_files",
              field: "file_id",
            },
          },
        })
        .execute();

      const formatted_data = res?.data?.map((data) => {
        const { contact_files, files } = data;
        const _files = pick(files, [
          "originalname",
          "mimetype",
          "download_path",
        ]);
        const _contact_files = pick(contact_files, [
          "id",
          "file_id",
          "contact_id",
        ]);
        return {
          ..._contact_files,
          ..._files,
        };
      });

      return formatted_data;
    }),
  getContactFilesByContactId: privateProcedure
    .input(
      z.object({
        contact_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {} } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        contact_id: input.contact_id,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: entity,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return res.data || [];
    }),
});
