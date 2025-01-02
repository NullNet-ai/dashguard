import { CardContent } from "~/components/ui/card"
import SelectedView from "../../../custom/FormFilter/SelectedView"

interface ISelectedViewLayoutProps {
  filterGridConfig: any
  formGridSelected: any[]
  handleRemovedSelectedRecords: (records: any[]) => void
  handleUpdateDisplayType: (type: any) => void
}

const SelectedViewLayout = (props: ISelectedViewLayoutProps) => {
  const {
    filterGridConfig,
    formGridSelected,
    handleRemovedSelectedRecords,
    handleUpdateDisplayType
  } = props;
  return (
    <CardContent className="w-full">
        <SelectedView
          renderComponentSelected={
            filterGridConfig?.renderComponentSelected
          }
          handleRemovedSelectedRecords={
            handleRemovedSelectedRecords
          }
          handleUpdateDisplayType={handleUpdateDisplayType}
          records={formGridSelected}
        />
    </CardContent>
  )
}

export default SelectedViewLayout;