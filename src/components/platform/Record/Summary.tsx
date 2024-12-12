/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

const Summary = ({ code }: { code: string }) => {
  const data = {} as any;
  // const currentCode = data?.code;
  const email = data?.EmailAddress;
  const phone_number = data?.phone_number;
  const creationDate = data?.created_at
    ? new Date(data.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const firstName = data?.first_name;
  const lastName = data?.last_name;
  const id = data?.id;
  const updatedAt = data?.updated_at
    ? new Date(data.updated_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const status = data?.status;
  return (
    <aside className="sticky top-0 row-span-3 flex flex-col rounded-md border border-t-4 bg-background">
      {/* {JSON.stringify(data, null, 4)} */}
      <section className="space-y-2 text-nowrap border-b bg-muted/60 p-6">
        <h5 className="font-semibold">Code: {code}</h5>
        <p className="text-sm text-muted-foreground">Date: {creationDate}</p>
        <p className={`text-sm capitalize text-muted-foreground`}>
          Status:{" "}
          <span
            className={`rounded p-1 ${status === "active" ? "bg-green-400/50" : "bg-red-400/50"}`}
          >
            {status}{" "}
          </span>{" "}
        </p>
      </section>
      <article className="space-y-5 p-6">
        {[
          { label: "Name", value: `${firstName} ${lastName}` },
          { label: "Email", value: email?.[0]?.email },
          { label: "Phone", value: phone_number?.[0]?.number },
          { label: "ID", value: id?.toString() },
          { label: "Status", value: status?.toString() },
        ].map(({ label, value }) => (
          <p className="text-sm text-muted-foreground" key={label}>
            {label}: <span className={`text-sm text-foreground`}>{value}</span>
          </p>
        ))}
      </article>
      <section className="mt-auto flex flex-col gap-2 justify-self-end border-t bg-muted/60 p-6">
        <p className="text-sm text-muted-foreground">
          Last Updated: <span className="text-foreground">{updatedAt}</span>
        </p>
      </section>
    </aside>
  );
};

export default Summary;
