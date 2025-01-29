import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

export default function Groups() {
  return (
    <div className="flex max-w-7xl items-center justify-between sm:px-4 lg:px-6">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
            Group
            <RectangleGroupIcon
              aria-hidden="true"
              className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute left-0 z-10 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            {[].map(() => (
              <></>
              // <MenuItem key={option.name}>
              //   <a
              //     href={option.href}
              //     className={cn(
              //       option.current
              //         ? "font-medium text-gray-900"
              //         : "text-gray-500",
              //       "block px-4 py-2 text-sm data-[focus]:bg-gray-100",
              //     )}
              //   >
              //     {option.name}
              //   </a>
              // </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
