type state =
  | Loading
  | Loaded(array<Workout.t>)
  | Failed

type msg =
  | Initialize
  | WorkoutsLoaded(result<array<Workout.t>, string>)

let initialState = Loading

let update = (_state: state, msg: msg, dispatch: msg => unit) => {
  switch msg {
  | Initialize =>
    let _ = Api.Workouts.get()->Promise.thenResolve(result => dispatch(WorkoutsLoaded(result)))
    Loading
  | WorkoutsLoaded(Ok(workouts)) => Loaded(workouts)
  | WorkoutsLoaded(Error(msg)) =>
    Console.error(msg)
    Failed
  }
}

let program = Tea.Program.make(initialState, update)

let context = React.createContext(program)

module Provider = {
  let make = React.Context.provider(context)
}

let useState = Tea.useState(context, _)
let useDispatch = () => Tea.useDispatch(context)
