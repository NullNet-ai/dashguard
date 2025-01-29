  const getPercentage = (value: number, totalRecordsCount: number) => {
    return (((value ?? 0) / totalRecordsCount) * 100).toFixed(0);
  };

  export default getPercentage;