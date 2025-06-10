'use client';
import { Button } from '~/components/ui/button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const RefreshButton = () => {
  return (
    <Button
      className="text-red-500 hover:text-red-500 focus:outline-none h-6"
      Icon={ArrowPathIcon}
      size="sm"
      type="button"
      variant="ghost"
      aria-label="Retry"
      title="Retry"
      onClick={() => window.location.reload()}
    />
  );
};

export default RefreshButton;
