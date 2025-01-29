import { IReturnOnSelectRecords } from "~/components/platform/FormBuilder/types";

const onRemoveSelectedRecords = async ({
  filter_entity,
  main_entity_id,
  rows,
}: IReturnOnSelectRecords): Promise<IReturnOnSelectRecords> => {
  alert("Remove Selected Records");
  return await Promise.resolve({
    filter_entity,
    main_entity_id,
    rows,
  });
};

export default onRemoveSelectedRecords;