import StateTab from '~/components/platform/StateTab';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useManageFilter } from './Provider';
import ColumnContent from './Tabs/Columns';
import FilterContent from './Tabs/Filter';
import GroupContent from './Tabs/Group';
import SortContent from './Tabs/Sort';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';

const ErrorMessages = ({ messages }: { messages: string[] }) => {
  if (!messages || messages.length === 0) return null;
  
  return (
    <div className="mb-4">
      <Alert 
        variant="error" 
        withAccentBorder 
        className="border rounded-md shadow-sm"
      >
        <AlertTitle className="flex items-center gap-2 font-medium">
          Validation Errors
        </AlertTitle>
        <AlertContent className="mt-2">
          <ul className="list-disc pl-5 space-y-1">
            {messages.map((message, index) => (
              <li key={index} className="text-sm">{message}</li>
            ))}
          </ul>
        </AlertContent>
      </Alert>
    </div>
  );
};

export default function SideDrawer() {
  const { state, actions } = useManageFilter();
  const { tab_props, filterDetails, createFilterLoading, errorMessages, filterType } = state ?? {};
  const tabs = [
    {
      id: 'filter',
      label: 'Filter',
      content: <FilterContent />,
    },
    {
      id: 'sort',
      label: 'Sort',
      content: <SortContent />,
    },
    ...(filterType !== 'timeline' ? [
      {
        id: 'group',
        label: 'Group',
        content: <GroupContent />,
      },
      {
        id: 'columns',
        label: 'Columns',
        content: <ColumnContent />,
      },
    ] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        {tab_props.id ? (
          <>
            <Button
              variant="default"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={actions.saveUpdatedFilter}
              loading={createFilterLoading}
            >
              ✓ Update Filter
            </Button>
            <Button
              variant="secondary"
              onClick={actions.handleCreateNewFilter}
              loading={createFilterLoading}
            >
              ✓ Apply as New Filter
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={actions.handleCreateNewFilter}
            loading={createFilterLoading}
          >
            ✓ Apply Filter
          </Button>
        )}
      </div>

      {errorMessages && errorMessages.length > 0 && <ErrorMessages messages={errorMessages} />}

      <div className="space-y-2">
        <label htmlFor="filterName" className="text-sm font-bold text-gray-700">
          Name
        </label>
        <div className="flex items-center justify-between">
          <Input
            id="filterName"
            placeholder="Filter Name"
            value={filterDetails.name}
            onChange={(e) => actions.handleUpdateFilter({
              name: e.target.value
            })}
            className="max-w-full"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <StateTab
          defaultValue="filter"
          tabs={tabs}
          variant="underline"
          size="sm"
        />
      </div>
    </div>
  );
}
