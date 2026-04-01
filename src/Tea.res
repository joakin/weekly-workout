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
  let selectedStateCache: React.ref<option<'selectedState>> = React.useRef(None)

  React.useSyncExternalStore(
    ~subscribe=onStoreChange => {
      let notify = _ => onStoreChange()
      Program.subscribe(program, notify)
      () => Program.unsubscribe(program, notify)
    },
    ~getSnapshot=() => {
      let selectedState = select(program.state)

      switch selectedStateCache.current {
      | Some(previousSelectedState) if previousSelectedState == selectedState =>
        previousSelectedState
      | _ =>
        selectedStateCache.current = Some(selectedState)
        selectedState
      }
    },
  )
}

let useDispatch = (context: React.Context.t<Program.t<'state, 'msg>>) => {
  let program = React.useContext(context)
  action => Program.dispatch(program, action)
}
