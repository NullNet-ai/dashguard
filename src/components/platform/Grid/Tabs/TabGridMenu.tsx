import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { type IFilterBy } from "../Category/type";
import ReportDropdownProperties from "./ReportProperties";
import RemoveFromFavorites from "./RemoveFromFavorites";
import { type ITabGrid } from "~/server/api/types";
import CloseReport from "./CloseReport";
interface IProps extends IFilterBy {
  tab?: ITabGrid;
}

export default function TabGridMenu({
  tab,
  filter_id,
  filter_by,
  sort_by,
}: IProps) {
  return (
    <DropdownMenuContent align="end">
      {tab?.default ? null : <CloseReport filter_id={filter_id} />}
      <ReportDropdownProperties
        sort_by={sort_by}
        filter_by={filter_by}
        filter_id={filter_id}
      />
      <DropdownMenuSeparator />
      <RemoveFromFavorites />
    </DropdownMenuContent>
  );
}
