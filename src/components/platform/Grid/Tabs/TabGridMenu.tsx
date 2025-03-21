import {
  DropdownMenuContent
} from '~/components/ui/dropdown-menu';
import { type ITabGrid } from '~/server/api/types';
import { type IFilterBy } from '../Category/type';
import ManageFilter from './ManageFilter';
interface IProps extends IFilterBy {
  tab?: ITabGrid;
  tabs?: any[]
  entity?: any
}

export default function TabGridMenu({
  tab,
  filter_by,
  filter_id,
  entity,
  tabs
}: IProps) {

  return (
    <DropdownMenuContent align="start">
      <ManageFilter tab={tab} tabs={tabs || []} entity={entity}/>
    </DropdownMenuContent>
  );
}
