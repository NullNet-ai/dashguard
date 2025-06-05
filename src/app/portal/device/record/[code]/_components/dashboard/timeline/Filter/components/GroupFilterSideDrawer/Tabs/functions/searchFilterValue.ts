import { searchRecords } from "./search";

export const searchFilterValues = async ({
  searchTerm,
  searchConfig,
  fieldConfig,
  field_name
}: {
  searchTerm: string;
  searchConfig: any;
  fieldConfig: any;
  field_name : string
}): Promise<Array<{ value: string; label: string }>> => {

  try {
    const response = await searchRecords({
      value: searchTerm,
      field: field_name,
      entity: 'contact',
      searchConfig,
      fieldConfig
    });

    return response;
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return []; // Return empty array on error
  }
};