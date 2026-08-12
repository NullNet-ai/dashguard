import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from 'react-hook-form';
import { type IField } from '../../types';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import CodeEditor from '~/components/ui/code-editor';
import CreditCard from '~/components/ui/credit-card/CreditCard';
import SavedCards, {
  SavedCard,
} from '~/components/ui/credit-card/_components/save-cards';
import { useCreditCardForm } from '~/components/ui/credit-card/_components';

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
  savedCardOptions?: SavedCard[];
  onSetPrimary?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

export default function FormCreditCard({
  fieldConfig,
  formRenderProps,
  formKey,
  form,
  savedCardOptions,
  onSetPrimary,
  onDeleteCard,
}: IProps) {
  const isDisabled = fieldConfig.disabled ?? form?.formState.disabled;
  const isReadOnly = fieldConfig.readonly;
  const {
    formData,
    errors,
    focused,
    cardType,
    handleInputChange,
    handleExpiryDateChange,
    handleSubmit,
    handleFocus,
    handleBlur,
  } = useCreditCardForm({
    form,
    fieldConfig,
    formRenderProps,
    formKey,
  });

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <>
          <CreditCard
            disabled={isDisabled}
            readonly={isReadOnly}
            formData={formData}
            errors={errors}
            focused={focused}
            cardType={cardType}
            handleInputChange={handleInputChange}
            handleExpiryDateChange={handleExpiryDateChange}
            handleSubmit={handleSubmit}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
            savedCards={form.getValues('saved-cards')}
          />
          <div className="!mt-8 max-w-[500px]">
            <h2 className="mb-2 text-base font-semibold">Your Saved Cards</h2>
            <SavedCards
              cards={savedCardOptions}
              onSetPrimary={onSetPrimary}
              onDeleteCard={onDeleteCard}
            />
          </div>
        </>
      </FormControl>
    </FormItem>
  );
}
