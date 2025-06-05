// Custom render functions for the multi-select component
export const renderOption = (option: { value: string; label: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
        {option.label.charAt(0).toUpperCase()}
      </div>
      <span>{option.label}</span>
    </div>
  );
};



