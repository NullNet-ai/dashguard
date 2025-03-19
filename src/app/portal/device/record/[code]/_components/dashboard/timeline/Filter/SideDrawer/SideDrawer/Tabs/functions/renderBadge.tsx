export const renderBadge = (
  option: { value: string; label: string },
  handleUnselect: (option: { value: string; label: string }) => void,
) => {
  return (
    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-700">
        {option.label.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm">{option.label}</span>
      <button
        onClick={() => handleUnselect(option)}
        className="ml-1 text-blue-500 hover:text-blue-700"
      >
        ×
      </button>
    </div>
  );
};
