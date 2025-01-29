import { IReturnOnSelectRecords } from "~/components/platform/FormBuilder/types";

const onSelectRecords = async ({
  filter_entity,
  main_entity_id,
  rows,
}: IReturnOnSelectRecords) => {
  alert("Select Records");
  return await Promise.resolve({
    filter_entity,
    main_entity_id,
    rows,
  });
};

export default onSelectRecords;
