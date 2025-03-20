import { Check } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function Header() {
  return (
    <div className="flex items-center justify-end p-4">
      <Button iconPlacement={'left'} iconClassName='ms-2' Icon={Check}>  Create New Filter </Button>
    </div>
  );
}
