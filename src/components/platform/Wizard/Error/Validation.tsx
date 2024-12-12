"use client";
interface IValidation {
  messages: Record<string, string[]>;
}
export default function Validation({ messages }: IValidation) {
  return (
    <>
      {Object?.keys(messages ?? {}).length > 0 && (
        <div className="m-2 mt-4 rounded-md bg-red-200 p-2">
          {Object?.entries(messages ?? {}).map(([key, value]) => {
            return <div key={key}>{value || ""}</div>;
          })}
        </div>
      )}
    </>
  );
}
