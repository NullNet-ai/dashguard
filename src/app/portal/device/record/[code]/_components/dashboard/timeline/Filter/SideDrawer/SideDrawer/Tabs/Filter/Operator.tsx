'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface IGroup {
  groupOperator: 'and' | 'or'
}

interface IProps {
  group: IGroup
  groupIndex: number
  handleUpdateGroupOperator: (index: number, value: 'and' | 'or') => void
}

export default function GroupAdvOperator(
  { group, groupIndex, handleUpdateGroupOperator }: IProps
) {
  return (
    <Select
      value={group.groupOperator}
      onValueChange={(value: 'and' | 'or') => handleUpdateGroupOperator(groupIndex, value) }
    >
      <SelectTrigger className="h-8 w-fit border-gray-200 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="and">AND</SelectItem>
        <SelectItem value="or">OR</SelectItem>
      </SelectContent>
    </Select>
  )
}
