module State = {
  type t = {}
}

module Config = {
  module Target = {
    type t
    external node: Dom.node => t = "%identity"
    external ref: React.ref<React.element> => t = "%identity"
  }

  type eventOptions = {
    passive?: bool,
    capture?: bool,
  }

  type shared = {
    target?: Target.t,
    eventOptions?: eventOptions,
    window?: Dom.window,
    enabled?: bool,
  }

  type drag = {}
  type useDrag = {...shared, ...drag}

  type move = {}
  type useMove = {...shared, ...move}

  type hover = {}
  type useHover = {...shared, ...hover}

  type scroll = {}
  type useScroll = {...shared, ...scroll}

  type wheel = {}
  type useWheel = {...shared, ...wheel}

  type pinch = {}
  type usePinch = {...shared, ...pinch}

  type useGesture = {
    ...shared,
    drag?: drag,
    move?: move,
    hover?: hover,
    scroll?: scroll,
    wheel?: wheel,
    pinch?: pinch,
  }
}

@module("@use-gesture/react")
module React = {
  external useDrag: (State.t => unit, Config.useDrag) => 'args => ReactDOM.domProps = "useDrag"

  external useMove: (State.t => unit, Config.useMove) => 'args => ReactDOM.domProps = "useMove"

  external useHover: (State.t => unit, Config.useHover) => 'args => ReactDOM.domProps = "useHover"

  external useScroll: (State.t => unit, Config.useScroll) => 'args => ReactDOM.domProps =
    "useScroll"

  external useWheel: (State.t => unit, Config.useWheel) => 'args => ReactDOM.domProps = "useWheel"

  external usePinch: (State.t => unit, Config.usePinch) => 'args => ReactDOM.domProps = "usePinch"

  // TODO: Missing native dom handlers which this shit enriches, see
  // https://use-gesture.netlify.app/docs/gestures/#native-event-handlers-in-react
  type useGestureCallbacks = {
    onDrag?: State.t => unit,
    onDragStart?: State.t => unit,
    onDragEnd?: State.t => unit,
    onPinch?: State.t => unit,
    onPinchStart?: State.t => unit,
    onPinchEnd?: State.t => unit,
    onScroll?: State.t => unit,
    onScrollStart?: State.t => unit,
    onScrollEnd?: State.t => unit,
    onMove?: State.t => unit,
    onMoveStart?: State.t => unit,
    onMoveEnd?: State.t => unit,
    onWheel?: State.t => unit,
    onWheelStart?: State.t => unit,
    onWheelEnd?: State.t => unit,
    onHover?: State.t => unit,
  }
  external useGesture: (useGestureCallbacks, Config.useGesture) => 'args => ReactDOM.domProps =
    "useHover"
}
