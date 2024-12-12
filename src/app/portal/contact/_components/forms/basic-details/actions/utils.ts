interface IDataType {
  phones: Record<string, string>[];
  emails: Record<string, string>[];
}

type GroupedContacts = {
  [contact_id: string]: {
    id: string;
    phones: string[];
    emails: string[];
    contact_status: string;
  };
};

const groupByContactId = (data: IDataType) => {
  return [...data.phones, ...data.emails].reduce<GroupedContacts>(
    (acc, item) => {
      const {
        contact_id,
        raw_phone_number,
        email,
        contact_status = "Active",
      } = item || {};
      if (!contact_id) return acc;

      // Initialize the contact_id entry if it doesn't exist yet
      acc[contact_id] ??= {
        phones: [],
        emails: [],
        id: contact_id,
        contact_status,
      };

      // Add raw phone number if available
      if (raw_phone_number) acc?.[contact_id]?.phones.push(raw_phone_number);
      // Add email if available
      if (email) acc?.[contact_id]?.emails.push(email);

      return acc;
    },
    {},
  );
};

export const identifyExistingPrimaryPhoneAndEmail = async (
  data: IDataType,
  new_contact_id: string,
) => {
  const grouped_contact_data = groupByContactId(data);

  const existing_contact = Object.entries(grouped_contact_data).map(
    ([key, value]) => {
      if (
        value?.phones.length &&
        value?.emails.length &&
        key !== new_contact_id
      ) {
        return { id: key, status: value?.contact_status };
      }
    },
  );

  return existing_contact?.filter(Boolean);
};

export const transformDataToOptions = (data: any) => {
  return data?.map((item: any) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
};
