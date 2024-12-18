import { ComboboxOption } from "@headlessui/react";
import { useContext } from "react";
import { SearchGridContext } from "./Provider";
import { Badge } from "~/components/ui/badge";
import { ISearchItemResult } from "./types";

export default function SearchResult({
  results,
}: {
  results: ISearchItemResult[] | null;
}) {
  const { actions, state } = useContext(SearchGridContext);
  if (!results)
    return (
      <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
        Searching...
      </h2>
    );
  return (
    <>
      {results?.length > 0 ? (
        <ul className="text-sm text-gray-700">
          {results?.map((result) => (
            <ComboboxOption
              as="li"
              key={result.id}
              value={result}
            >
              <div className="mb-2 ml-3">{result.values?.[0]}</div>
              <Badge
                key={result.id}
                variant="primary"
                onClick={() => {
                  actions?.handleAddSearchItem(result);
                }}
              >
                {result?.label}
              </Badge>
            </ComboboxOption>
          ))}
        </ul>
      ) : (
        <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
          No Results Found
        </h2>
      )}
    </>
  );
}
