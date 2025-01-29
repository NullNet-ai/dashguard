import { AccordionContent } from '~/components/ui/accordion';
import { cn } from '~/lib/utils';
import { IFilterGridConfig } from '../../../types';
import FormFilterGrid from '../../custom/FormFilter/List';

interface IFormFilterGridLayoutProps {
  isFormOpen: boolean;
  handleListLoading: (loading: boolean) => void;
  handleSelectedGridRecords: (records: any[]) => void;
  handleCloseGrid: () => void;
  filterGridConfig: IFilterGridConfig;
  className?: string;
}

const FormFilterGridLayout = (props: IFormFilterGridLayoutProps) => {
  const {
    isFormOpen,
    handleListLoading,
    handleSelectedGridRecords,
    handleCloseGrid,
    filterGridConfig,
    className
  } = props;
  return (
    <AccordionContent
        className={cn(
          "relative w-full z-50",
          isFormOpen
            ? "accordion-content-enter accordion-content-enter-active"
            : "accordion-content-exit accordion-content-exit-active",
        )}
      >
        <FormFilterGrid
          handleListLoading={handleListLoading}
          handleSelectedGridRecords={handleSelectedGridRecords}
          handleCloseGrid={handleCloseGrid}
          config={{
            ...filterGridConfig,
          }}
          className={className}
        />
      </AccordionContent>
  )
}

export default FormFilterGridLayout