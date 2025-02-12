

import { Table, TableHeader } from "~/components/ui/table";
import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import React from "react";
import { ScrollBar } from "~/components/ui/scroll-area";
import MyTableHead from "../../TableHead";
import MyTableBody from "../../TableBody";
import Pagination from "../../Pagination";
import Header from "../../Header";
import ScrollContainer from "./common/GridScrollContainer";
import GridDesktopContainer from "./common/GridDesktopContainer";


function GridDesktop({parentType}: any) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      <CardHeader>
        <Header />
      </CardHeader>
      <ScrollContainer parentType={parentType}>
          <GridDesktopContainer />
        {/* <ScrollBar orientation="horizontal" /> */}
      </ScrollContainer>
      <div className="sticky bottom-0">
        <CardFooter>
          <Pagination />
        </CardFooter>
      </div>
    </Card>
  );
}

export default GridDesktop;
