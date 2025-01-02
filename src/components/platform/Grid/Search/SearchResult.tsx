import { ComboboxOption } from "@headlessui/react";
import { useContext } from "react";
import { SearchGridContext } from "./Provider";
import { Badge } from "~/components/ui/badge";
import { ISearchItemResult } from "./types";
import { Separator } from "~/components/ui/separator";

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
            <>
              <ComboboxOption
                as="li"
                key={result.id}
                value={result}
                className={"cursor-pointer hover:bg-muted/70"}
                onClick={() => {
                  actions?.handleAddSearchItem(result);
                }}
              >
                <div className="mb-2 ml-3">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {result.values?.[0]}
                  </span>
                </div>
                <Badge
                  key={result.id}
                  variant="primary"
                  className="hover:bg-primary/20"
                >
                  {result?.label}
                </Badge>
              </ComboboxOption>
              {results.length > 1 && <Separator dashed className="m-2" />}
            </>
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
