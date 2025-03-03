import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { type IFilterBy } from '../Category/type';
import ReportDropdownProperties from './ReportProperties';
import RemoveFromFavorites from './RemoveFromFavorites';
import { type ITabGrid } from '~/server/api/types';
import CloseReport from './CloseReport';
import ManageFilter from './ManageFilter';
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
      <ManageFilter tab={tab} />
    </DropdownMenuContent>
  );
}
