const onFilterFieldChange = ():
  | {
      totalCount: number;
      items: any[];
      currentPage: number;
      totalPages: number;
    }
  | undefined => {
  alert("Filter Field Change");
  return undefined;
};

export default onFilterFieldChange;
