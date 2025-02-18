'use client';

import { XIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { type z } from 'zod';

import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { ContactCategoryDetailsSchema } from '~/server/zodSchema/contact/categoryDetails';

import { type IFormProps } from '../types';

import { UpdateCategory } from './actions/updateCategory';
import CustomCategoryDetails from './CategoryDetails';

export default function CategoryDetails({ params, defaultValues }: IFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const { shell_type } = params;
  const { categories } = defaultValues || {};

  useEffect(() => {
    if (shell_type === 'wizard' && categories)
      router.replace(`${pathname}?categories=${categories}`);
  }, [categories, shell_type]);

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactCategoryDetailsSchema>>) => {
    try {
      await UpdateCategory({
        id: params.id,
        categories: data.categories ?? '',
      });
      toast.success('Category Details submitted successfully.');
    } catch (error) {
      toast.error('Failed to submit Category Details.');
    }
  };

  return (
    <FormBuilder
      customRender={(form) => <CustomCategoryDetails form={form} />}
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      features={{
        enableFormHostLockActions: false,
      }}
      fields={[]}
      formKey={'CategoryDetails'}
      formLabel={'Category Details'}
      formProps={params}
      formSchema={ContactCategoryDetailsSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
    />
  );
}
