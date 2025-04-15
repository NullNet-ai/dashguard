import { type TActionUIState, type IActionCondition } from '../types'

import { valueExtractor } from './valueExtractor'

interface IActionConditions {
  hidden: Partial<IActionCondition>
  disabled: Partial<IActionCondition>
}

interface IActionConditionArgs {
  row_data: Record<string, any>
  state_conditions: IActionConditions
}
export const getActionConditionResult = ({
  row_data,
  state_conditions,
}: IActionConditionArgs): Record<TActionUIState, boolean> => {
  if (!state_conditions) {
    return { hidden: false, disabled: false }
  }
  const actionState = Object.entries(state_conditions).reduce(
    (acc, [state_type, state_condition]) => {
      const { match_condition, conditions }
        = state_condition as IActionCondition

      if (match_condition === 'match_all') {
        const stateValue = conditions!.every((condition) => {
          const extractedValue = valueExtractor(condition.accessor, row_data)
          if (typeof extractedValue === 'string') {
            return !!condition.value.find(
              value => value?.toString().toLowerCase()
                === extractedValue.toLowerCase(),
            )
          }

          return condition.value.includes(
            extractedValue as number | null | boolean,
          )
        })
        return { ...acc, [state_type]: stateValue }
      }
      else if (match_condition === 'match_any') {
        const stateValue = conditions!.some((condition) => {
          const extractedValue = valueExtractor(condition.accessor, row_data)
          if (typeof extractedValue === 'string') {
            return !!condition.value.find(
              value => value?.toString().toLowerCase()
                === extractedValue.toLowerCase(),
            )
          }

          return condition.value.includes(
            extractedValue as number | null | boolean,
          )
        })
        return { ...acc, [state_type]: stateValue }
      }

      return { ...acc, [state_type]: false }
    }, {} as Record<TActionUIState, boolean>,
  )
  return actionState
}
