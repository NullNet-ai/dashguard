import { StarIcon } from "lucide-react";

import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

export default function RemoveFromFavorites() {
  return (
    <DropdownMenuItem className="flex gap-2">
      <StarIcon className="h-4 w-4 text-yellow-400" />
      <span>Remove from Favorites</span>
    </DropdownMenuItem>
  );
}
