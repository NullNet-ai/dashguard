// "use client";

// import * as React from "react";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import { getMenuList } from "~/lib/menu";
// import { cn } from "~/lib/utils";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "../ui/tooltip";
// import {
//   ChevronLeftIcon,
//   EllipsisHorizontalIcon,
// } from "@heroicons/react/20/solid";
// import { CollapseMenuButton } from "../ui/collapse-menu-button";

// interface IProps {
//   isOpen: boolean;
//   toggleOpen: () => void;
// }

// const SideBar: React.FC<IProps> = ({ isOpen, toggleOpen }) => {
//   const pathName = usePathname();
//   const MenuItems = getMenuList(pathName);
//   const [isHovered, setIsHovered] = React.useState(false);
//   return (
//     <aside
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       className="sidebar left-0 top-0 hidden flex-col border-r-2 bg-background xl:flex"
//     >
//       {/* Left-pointing arrow when sidebar is collapsed */}
//       {isHovered && (
//         <div
//           style={{ left: isOpen ? "180px" : "50px", top: "40px" }}
//           className={cn(
//             `z-99 absolute flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-primary/40 bg-gray-200 shadow-md transition-all duration-300 hover:bg-gray-300`,
//           )}
//         >
//           <ChevronLeftIcon
//             className={cn(
//               "h-5 w-5 text-gray-700 transition-transform duration-300", // Smooth animation
//               isOpen ? "rotate-0" : "rotate-180", // Rotation applied
//             )}
//             onClick={() => toggleOpen()}
//           />
//         </div>
//       )}

//       <Image
//         alt="Your Company"
//         src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
//         className="absolute left-3 top-3 h-8 w-auto"
//         width={32}
//         height={32}
//       />
//       <nav className="mt-[54px] flex flex-col gap-4 overflow-hidden border-t-2 p-2">
//         {MenuItems.map(({ groupLabel, menus, id }) => (
//           <li
//             className={cn("w-full list-none", groupLabel ? "pt-5" : "")}
//             key={id}
//           >
//             {(isOpen && groupLabel) || isOpen === undefined ? (
//               // <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
//               //   {groupLabel}
//               // </p>
//               <div className="relative p-2">
//                 <div
//                   aria-hidden="true"
//                   className="absolute inset-0 flex items-center"
//                 >
//                   <div className="w-full border-t border-gray-300" />
//                 </div>
//                 <div className="relative flex justify-center">
//                   <span className="rounded-sm bg-muted px-2 text-sm font-medium text-gray-500 text-muted-foreground">
//                     {groupLabel}
//                   </span>
//                 </div>
//               </div>
//             ) : !isOpen && isOpen !== undefined && groupLabel ? (
//               <TooltipProvider>
//                 <Tooltip delayDuration={100}>
//                   <TooltipTrigger className="w-full">
//                     <div className="flex w-full items-center justify-center">
//                       <EllipsisHorizontalIcon className="h-5 w-5" />
//                     </div>
//                   </TooltipTrigger>
//                   <TooltipContent side="right">
//                     <p>{groupLabel}</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             ) : (
//               <p className="pb-2"></p>
//             )}
//             {menus.map(
//               ({ href, label, icon: Icon, active, submenus, id: _id }) =>
//                 !submenus || submenus.length === 0 ? (
//                   <div className="w-full" key={_id}>
//                     <TooltipProvider disableHoverableContent>
//                       <Tooltip delayDuration={100}>
//                         <TooltipTrigger asChild>
//                           <Link
//                             className={`mb-1 flex h-10 w-full flex-row items-center justify-start rounded-md p-2 hover:bg-secondary ${active ? "bg-primary/20" : ""}`}
//                             href={href}
//                           >
//                             <span
//                               className={cn(isOpen === false ? "" : "mr-4")}
//                             >
//                               <Icon className="h-5 w-5" />
//                             </span>
//                             <p
//                               className={cn(
//                                 "max-w-[200px] truncate text-muted-foreground",
//                                 isOpen === false
//                                   ? "-translate-x-96 opacity-0"
//                                   : "translate-x-0 opacity-100",
//                               )}
//                             >
//                               {label}
//                             </p>
//                           </Link>
//                         </TooltipTrigger>
//                         {isOpen === false && (
//                           <TooltipContent side="right">{label}</TooltipContent>
//                         )}
//                       </Tooltip>
//                     </TooltipProvider>
//                   </div>
//                 ) : (
//                   <div className="w-full" key={_id + "collapse"}>
//                     <CollapseMenuButton
//                       icon={Icon}
//                       label={label}
//                       active={active}
//                       submenus={submenus}
//                       isOpen={isOpen}
//                     />
//                   </div>
//                 ),
//             )}
//           </li>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default React.memo(SideBar);

export {};
