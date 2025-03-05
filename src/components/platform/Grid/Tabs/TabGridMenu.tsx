import {
  DropdownMenuContent
} from '~/components/ui/dropdown-menu';
import { type ITabGrid } from '~/server/api/types';
import { type IFilterBy } from '../Category/type';
import ManageFilter from './ManageFilter';
interface IProps extends IFilterBy {
  tab?: ITabGrid;
}

export default function TabGridMenu({
  tab,
}: IProps) {
  return (
    <DropdownMenuContent align="end">
      <ManageFilter tab={tab} />
    </DropdownMenuContent>
  );
}
