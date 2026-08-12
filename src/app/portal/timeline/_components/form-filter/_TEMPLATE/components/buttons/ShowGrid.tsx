import { EyeSlashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { Button as Button2 } from '@headlessui/react';
import { cn } from '~/lib/utils';
interface IProps {
  isListLoading: boolean;
  index: number;
  handleSetIsSearchOpen: () => void;
  isSearchOpen: boolean;
}

export default function ShowGridButton({
  isListLoading,
  isSearchOpen,
  handleSetIsSearchOpen,
}: IProps) {
  return (
    <div>
      {isListLoading ? (
        <Loader2 className={cn('h-5 w-5 animate-spin text-gray-400')} />
      ) : (
        <Button2
          className="inline-flex h-7 items-center gap-1 rounded bg-indigo-100 px-2 py-2 text-sm text-primary hover:bg-indigo-200"
          onClick={handleSetIsSearchOpen}
        >
          {!isSearchOpen ? (
            <MagnifyingGlassIcon className="h-4 w-4 text-primary transition-none" />
          ) : (
            <EyeSlashIcon className="h-4 w-4 text-primary transition-none" />
          )}
          <span className="text-primary">
            {`${isSearchOpen ? 'Hide' : 'Show'} Grid`}
          </span>
        </Button2>
      )}
    </div>
  );
}
