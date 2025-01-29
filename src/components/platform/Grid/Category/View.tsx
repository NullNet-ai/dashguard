import React from "react";
import { CategoryProvider } from "./Provider";
import { type IFilterBy } from "../Category/type";
import TabSettings from "./Tab";

interface IProps extends IFilterBy {
  test?: any;
}

function CategoryView({ filter_by, filter_id, sort_by }: IProps) {
  return (
    <CategoryProvider
      sort_by={sort_by}
      filter_by={filter_by}
      filter_id={filter_id}
    >
      <TabSettings />
    </CategoryProvider>
  );
}

export default CategoryView;
