export const transformDataToOptions = (data: any) => {
  return data?.map((item: any) => {
    return {
      label: item,
      value: item,
    };
  });
};
