module Program = {
  type t<'state, 'msg> = {
    mutable state: 'state,
    update: ('state, 'msg, 'msg => unit) => 'state,
    subscribers: array<'state => unit>,
  }

  let rec dispatch = (program: t<'state, 'msg>, msg: 'msg) => {
    Console.log5("update(msg:", msg, ", state:", program.state, ")")
    program.state = program.update(program.state, msg, msg => dispatch(program, msg))
    Console.log2("result: ", program.state)

    Array.forEach(program.subscribers, subscriber => subscriber(program.state))
  }

  let subscribe = (program: t<'state, 'msg>, subscriber: 'state => unit) => {
    Array.push(program.subscribers, subscriber)
  }

  let unsubscribe = (program: t<'state, 'msg>, subscriber: 'state => unit) => {
    let index = Array.indexOf(program.subscribers, subscriber)
    if index > -1 {
      Array.splice(program.subscribers, ~start=index, ~remove=1, ~insert=[])
    }
  }

  let make = (initialState: 'state, update: ('state, 'msg, 'msg => unit) => 'state) => {
    {
      state: initialState,
      update,
      subscribers: [],
    }
  }
}

let useState = (
  context: React.Context.t<Program.t<'state, 'msg>>,
  select: 'state => 'selectedState,
) => {
  let program = React.useContext(context)
  let (selectedState, setState) = React.useState(_ => select(program.state))

  React.useSyncExternalStore(
    ~subscribe=_ => {
      let update = state =>
        setState(oldSelectedState => {
          let newSelectedState = select(state)
          // Shallow compare, return the old reference if they are the same
          newSelectedState == oldSelectedState ? oldSelectedState : newSelectedState
        })
      Program.subscribe(program, update)
      () => Program.unsubscribe(program, update)
    },
    ~getSnapshot=() => selectedState,
  )
}

let useDispatch = (context: React.Context.t<Program.t<'state, 'msg>>) => {
  let program = React.useContext(context)
  action => Program.dispatch(program, action)
}
