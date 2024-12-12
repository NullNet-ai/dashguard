type SetState<S> = (value: S | ((prevState: S) => S)) => void

export type {
  SetState
}
