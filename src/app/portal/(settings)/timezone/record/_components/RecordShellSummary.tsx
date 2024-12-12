import React from "react";

export default function RecordShellSummary({ timezone }: { timezone: string }) {
  return (
    <div className="px-1">
      <strong>Timezone:</strong>
      {timezone}
    </div>
  );
}
