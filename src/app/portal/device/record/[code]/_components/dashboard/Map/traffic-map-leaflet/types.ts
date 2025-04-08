interface IState {
  countryData: Record<string, any>
}

interface IAction {
  fetchCountryData: () => void
}

export interface IMapContext {
  state?: IState
  actions?: IAction
}
