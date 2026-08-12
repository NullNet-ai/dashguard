const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

export const ROOT_ENTITIES = [
  'device_interfaces',
  'aliases',
  'connections',
  'device_configurations',
  'device_filter_rules',
  'device_nat_rules',
  'device_heartbeats',
  'device_instances',
  'device_interface_addresses',
  'device_remote_access_sessions',
  'device_tunnels',
  'device_services',
  'ip_aliases',
  'ip_infos',
] as const;

export type TRootEntity = (typeof ROOT_ENTITIES)[number];

export function isRootEntity(entity: string): entity is TRootEntity {
  return (ROOT_ENTITIES as readonly string[]).includes(entity);
}

export async function getRootCredentials(dnaClient: any) {
  const rootAccount = await dnaClient
    .login('root', ROOT_ACCOUNT_PASSWORD, true)
    .execute();
  return {
    token: rootAccount?.data?.[0]?.token as string,
    as_root: true as const,
  };
}

export async function getEntityCredentials(
  entity: string,
  dnaClient: any,
  userToken: string,
) {
  if (isRootEntity(entity)) {
    return await getRootCredentials(dnaClient);
  }
  return { token: userToken, as_root: undefined };
}

export async function createRootOrm(dnaClient: any) {
  const { token, as_root } = await getRootCredentials(dnaClient);

  return {
    findAll(options: Record<string, any>) {
      return dnaClient.findAll({ ...options, token, as_root });
    },
    aggregate(options: Record<string, any>) {
      return dnaClient.aggregate({ ...options, token, as_root });
    },
    findOne(id: string, options: Record<string, any>) {
      return dnaClient.findOne(id, { ...options, token, as_root });
    },
    update(id: string, options: Record<string, any>) {
      return dnaClient.update(id, { ...options, token, as_root });
    },
    create(options: Record<string, any>) {
      return dnaClient.create({ ...options, token, as_root });
    },
  };
}
