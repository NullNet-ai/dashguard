import { AccordionContent } from '~/components/ui/accordion'
import { cn } from '~/lib/utils'

import { type IFilterGridConfig } from '../../../types'
import FormFilterGrid from '../../custom/FormFilter/List'

interface IFormFilterGridLayoutProps {
  isFormOpen: boolean
  handleListLoading: (loading: boolean) => void
  handleSelectedGridRecords: (records: any[]) => void
  handleCloseGrid: () => void
  filterGridConfig: IFilterGridConfig
  className?: string
  formKey?: string
}

const FormFilterGridLayout = (props: IFormFilterGridLayoutProps) => {
  const {
    isFormOpen,
    handleListLoading,
    handleSelectedGridRecords,
    handleCloseGrid,
    filterGridConfig,
    className,
    formKey,
  } = props
  return (
    <AccordionContent
      className={cn(
        'relative w-full z-50', isFormOpen
          ? 'accordion-content-enter accordion-content-enter-active'
          : 'accordion-content-exit accordion-content-exit-active',
      )}
    >
      <FormFilterGrid
        className={className}
        config={{
          ...filterGridConfig,
        }}
        formKey={formKey}
        handleCloseGrid={handleCloseGrid}
        handleListLoading={handleListLoading}
        handleSelectedGridRecords={handleSelectedGridRecords}
      />
    </AccordionContent>
  )
}

export default FormFilterGridLayout
