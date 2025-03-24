type state =
  | Loading
  | Loaded(array<Workout.t>)
  | Failed

type msg =
  | Initialize
  | WorkoutsLoaded(result<array<Workout.t>, unit>)

let initialState = Loading

let update = (state: state, msg: msg, dispatch: msg => unit) => {
  switch msg {
  | Initialize =>
    let _ =
      Api.Workouts.get()
      ->Promise.thenResolve(workouts => Ok(workouts))
      ->Promise.catch(_ => Promise.resolve(Error()))
      ->Promise.thenResolve(msg => dispatch(WorkoutsLoaded(msg)))

    Loading
  | WorkoutsLoaded(Ok(workouts)) => Loaded(workouts)
  | WorkoutsLoaded(Error()) => Failed
  }
}

let program = Tea.Program.make(initialState, update)

let context = React.createContext(program)

module Provider = {
  let make = React.Context.provider(context)
}

let useState = Tea.useState(context, _)
let useDispatch = () => Tea.useDispatch(context)
