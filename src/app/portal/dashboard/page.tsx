// import { EmployeesChart } from "./_cards/EmployeesChart";
// import { PositionsChart } from "./_cards/PositionsCard";
// import { BookingsCard } from "./_cards/BookingsCard";

import NewComingSoon from "~/app/coming-soon";
import ComingSoon from "../coming-soon/_components/coming_soon";

// export default function Page() {
//   return (
//     <main className="m-2">
//       <div className="px-2">
//         <h1 className="text-2xl font-bold">Dashboard</h1>
//       </div>
//         <div className="grid grid-cols-1 gap-y-2 p-2 md:gap-y-4 lg:grid-cols-3 lg:gap-2">
//           <PositionsChart />
//           <BookingsCard />
//           <EmployeesChart />
//         </div>
//     </main>
//   );
// }




export default function Page() {
  return (
    <NewComingSoon type="component"/>
  );
}