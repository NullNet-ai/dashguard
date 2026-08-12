import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavigationProps {
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  onPrevWeek,
  onNextWeek,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-30 flex gap-2">
      <button
        onClick={onPrevWeek}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white opacity-70 shadow-lg transition-all hover:bg-primary/90 hover:opacity-100 hover:shadow-xl"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Prev Week</span>
      </button>
      <button
        onClick={onNextWeek}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-white opacity-70 shadow-lg transition-all hover:bg-primary/90 hover:opacity-100 hover:shadow-xl"
      >
        <span className="text-sm font-medium">Next Week</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WeekNavigation;