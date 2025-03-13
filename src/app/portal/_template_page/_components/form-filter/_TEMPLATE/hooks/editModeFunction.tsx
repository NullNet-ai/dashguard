import { useState } from 'react';

interface EditMode {
  index: number;
  in_edit_mode: boolean;
}

export const useEditMode = (fields: any[]) => {
  const [editMode, setEditMode] = useState<EditMode[]>(
    () =>
      fields?.map((field, index) => ({
        index,
        in_edit_mode: field?.code ? false : true,
      })) || [],
  );

  return { editMode, setEditMode };
};
