import { EOperator } from "@dna-platform/common-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { CertificationDetailsSchema } from "~/server/zodSchema/contacts/certificationDetails";
import { EStatus } from "../types";
interface ICertificates {
  id: string;
  certificate_name: string;
  institution: string;
  issued_on_date: string;
  expiration_date: string;
}

const entity = "contact_certificate";

export const contactCertificateRouter = createTRPCRouter({
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
          entity,
          query: {
            advance_filters,
            pluck: [
              "id",
              "certificate_name",
              "institution",
              "issued_on_date",
              "expiration_date",
              "status",
            ],
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
      CertificationDetailsSchema.refine(
        (data) => {
          if (!data.certifications.length || !data.contact_id) return false;
          const isValid = data.certifications.every((certificate: any) => {
            const {
              certificate_name,
              institution,
              issued_on_date,
              expiration_date,
              id,
            } = certificate || {};
            return (
              (certificate_name ||
                institution ||
                issued_on_date ||
                expiration_date) &&
              id
            );
          });

          return isValid;
        },
        {
          message: "Form is empty.",
        },
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { contact_id, certifications } = input;

      const modifyContactCerts = async (cert: ICertificates) => {
        const { id, ...rest_cert } = cert || {};
        const get_cert = await ctx.dnaClient
          .findOne(id, {
            entity,
            token: ctx.token.value,
            query: {
              pluck: ["id"],
            },
          })
          .execute();

        if (get_cert?.data?.length) {
          const cert_id = get_cert?.data?.[0]?.id;
          return await ctx.dnaClient
            .update(cert_id, {
              entity,
              token,
              mutation: {
                params: rest_cert,
              },
            })
            .execute();
        }
        return await ctx.dnaClient
          .create({
            entity,
            token,
            mutation: {
              params: {
                contact_id,
                ...cert,
              },
            },
          })
          .execute();
      };
      const cert = await Promise.allSettled(
        certifications.map((item: any) => modifyContactCerts(item)),
      );
      const cert_ids: string[] = cert.map(
        (item: any) => item?.value?.data?.[0]?.id,
      );

      const not_used_cert = await ctx.dnaClient
        .findAll({
          entity,
          token,
          query: {
            pluck: ["id"],
            advance_filters: [
              {
                type: "criteria",
                field: "id",
                operator: EOperator.NOT_CONTAINS,
                values: cert_ids,
              },
            ],
            order: {
              limit: 100,
            },
          },
        })
        .execute();

      if (not_used_cert?.data?.length) {
        const certs = not_used_cert?.data;
        certs.forEach((cert: any) => {
          ctx.dnaClient
            .update(cert?.id, {
              entity,
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

      return cert;
    }),
});
