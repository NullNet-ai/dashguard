import { headers } from 'next/headers';
import { ulid } from 'ulid';

// includedEntities is the list of entities that we want to set the meta header for
const includedEntities = ['contact', 'organization', 'timeline', 'account_organization']

export const setMetaHeader = async (ctx: any, entity?: string) => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const referrer = headerList.get("referer") || "";
  const [, , , application, identifier] = pathname.split("/");
  const [,,, , app_entity, app, ref_id] = referrer.split("/");
  const base_url = process.env.NEXT_PUBLIC_ORIGIN_WEBSITE_URL || "";

  if (app_entity && !includedEntities.includes(app_entity)) {
      return
  }

  const meta = {
    entity: entity || app_entity,
    application: application,
    identifier: identifier,
    full_path: pathname,
    referer: {
      application: app,
      identifier: ref_id,
      full_path: referrer,
      entity: app_entity
    },
    reference_id: ref_id ==='new' ? ulid() : null
  }
      // eslint-disable-next-line no-console
  console.log("🚀 ~ setMetaHeader_meta:", meta)

  await ctx.dnaClient
    .setHeaders({
    'metadata': {
        'timeline-metadata': JSON.stringify(meta),
    }}).execute();
}

export const get_meta_header = async (entity?: string) => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const referrer = headerList.get("referer") || "";
  const [, , , application, identifier] = pathname.split("/");
  const [,,, , app_entity, app, ref_id] = referrer.split("/");

  if (app_entity && !includedEntities.includes(app_entity)) {
      return
  }

  const meta = {
    entity: entity ?? app_entity,
    application: application,
    identifier: identifier,
    full_path: pathname,
    referer: {
      application: app,
      identifier: ref_id,
      full_path: referrer,
      entity: app_entity
    },
    reference_id: ref_id ==='new' ? ulid() : null
  }
  return {
    'metadata': {
        'timeline-metadata': meta,
    }
  }

}
