"use client";
import { useContext } from "react";
import { GridContext } from "../../Provider";
import GridMobileRow from "./common/GridMobileRow";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "~/components/ui/loader";

const InfiniteScrollContainer = () => {
  const { state } = useContext(GridContext);
  return (
    <InfiniteScroll
      className="rounded-md text-card-foreground md:w-[92%] lg:w-full w-[86%]"
      dataLength={state?.data?.length}
      hasMore={true} // This will be true when more data is available
      next={() => {
        //code will be place here for fetching
      }}
      loader={<div className="flex justify-center p-4">
        <Loader size='md' variant='circularShadow'  label=""/>
      </div>}
    >
      <GridMobileRow />
    </InfiniteScroll>
  );
};

export default InfiniteScrollContainer;
