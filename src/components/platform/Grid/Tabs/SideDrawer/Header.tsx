import { Check } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { testIDFormatter } from '~/utils/formatter';

export default function Header() {
  return (
    <div className="flex items-center justify-end p-4">
      <Button 
        iconPlacement={'left'} 
        iconClassName='ms-2' 
        Icon={Check}
        data-test-id={testIDFormatter('filter-create-btn')}
      >
        Create New Filter
      </Button>
    </div>
  );
}
