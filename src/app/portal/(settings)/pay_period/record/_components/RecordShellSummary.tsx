import React from "react";

export default function RecordShellSummary({
  pay_period,
}: {
  pay_period: string;
}) {
  return (
    <div className="px-1">
      <strong>Pay Period:</strong>
      {pay_period}
    </div>
  );
}
