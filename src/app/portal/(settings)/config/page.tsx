import { api } from '~/trpc/server';

import WGAgentVersionForm from './_components/forms/wg-agent-version/client';

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const version = await api.device.fetchLatestVersion();

  return (
    <div className="space-y-2 p-4">
      <WGAgentVersionForm
        defaultValues={{ latest_version: version?.latest_version ?? '' }}
      />
    </div>
  );
}
