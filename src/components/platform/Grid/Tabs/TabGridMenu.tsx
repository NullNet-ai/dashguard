import { DropdownMenuContent } from '~/components/ui/dropdown-menu';
import { type ITabGrid } from '~/server/api/types';
import { type IFilterBy } from '../Category/type';
import ManageFilter from './ManageFilter';
interface IProps extends IFilterBy {
  tab?: ITabGrid;
  tabs?: any[];
  entity?: any;
  actions?: {
    handleDeleteTabs: (tab: any) => void;
  };
}

export default function TabGridMenu({ tab, entity, tabs, actions }: IProps) {
  return (
    <DropdownMenuContent align="start">
      <ManageFilter
        actions={actions}
        tab={tab}
        tabs={tabs || []}
        entity={entity}
      />
    </DropdownMenuContent>
  );
}
