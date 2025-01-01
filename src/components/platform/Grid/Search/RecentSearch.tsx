// import { ComboboxOption } from "@headlessui/react";
// import { useContext } from "react";
// import { SearchGridContext } from "./Provider";
// import { testIDFormatter } from "~/utils/formatter";

// export default function RecentSearch({ projects, entity }: { projects: any[], entity?: string }) {
//   const { actions } = useContext(SearchGridContext);
//   return (
//     <>
//       <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
//         Recent searches
//       </h2>
//       <ul className="text-sm text-gray-700">
//         {projects?.map((project) => (
//           <ComboboxOption
//             onClick={() => {
//               actions?.handleSearchSelected(project);
//             }}
//             as="li"
//             data-test-id={testIDFormatter(`${entity}-grd-search-inp-drd-itm`)}
//             key={project.id}
//             value={project}
//             className="group flex cursor-default select-none items-center rounded-md px-3 py-2 hover:bg-indigo-600 hover:text-white"
//           >
//             <span className="ml-3 flex-auto truncate">{project.name}</span>
//           </ComboboxOption>
//         ))}
//       </ul>
//     </>
//   );
// }
