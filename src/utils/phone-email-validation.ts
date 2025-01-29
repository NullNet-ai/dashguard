type Data = {
  phones_exist: Record<string, string>[];
  email_exist: Record<string, string>[];
};

/**
 * Gets a list of contact_ids that have both phone and email.
 * @param data - The data containing phones_exist and email_exist arrays.
 * @returns Array of contact_ids with both phone and email.
 */
export const getContactsWithPhoneAndEmail = (data: Data): string[] => {
  const phoneContactIds = new Set(
    data?.phones_exist?.map((phone) => phone?.contact_id),
  );
  const emailContactIds = new Set(
    data?.email_exist?.map((email) => email?.contact_id),
  );

  // Find intersection of both sets
  const result: string[] = [];
  phoneContactIds.forEach((contactId) => {
    if (emailContactIds.has(contactId)) {
      result.push(contactId!);
    }
  });

  return result?.filter(Boolean);
};
