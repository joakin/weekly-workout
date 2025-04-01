module State = {
  type t = {}
}

module Config = {
  type vec2 = (float, float)

  module Target = {
    type t
    external node: Dom.node => t = "%identity"
    external ref: React.ref<React.element> => t = "%identity"
  }

  /**
   * React note: If you want events not to be passive, you will need to attach
   * events directly to a node using target because of the way React handles
   * events
   */
  type eventOptions = {
    passive?: bool,
    capture?: bool,
  }

  type bounds = {top?: float, bottom?: float, left?: float, right?: float}

  type scaleBounds = {min?: float, max?: float}
  type angleBounds = {min?: float, max?: float}

  type sharedAndGesture = {
    enabled?: bool,
    eventOptions?: eventOptions,
  }

  type shared = {
    target?: Target.t,
    window?: Dom.window,
  }

  type gesture = {
    ...sharedAndGesture,
    from?: State.t => vec2,
    threshold?: vec2,
    preventDefault?: bool,
    triggerAllEvents?: bool,
    axis?: [#lock | #x | #y],
    rubberband?: vec2,
    transform?: vec2 => vec2,
  }

  type xy = {
    axisThreshold?: float,
    bounds?: State.t => bounds,
  }

  type dragAxisThreshold = {mouse: float, pen: float, touch: float}
  type dragPointer = {
    touch?: bool,
    capture?: bool,
    buttons?: array<float>,
    lock?: bool,
    keys?: bool,
  }
  type swipe = {
    distance?: vec2,
    duration?: float,
    velocity?: vec2,
  }
  type drag = {
    ...gesture,
    axisThreshold?: dragAxisThreshold,
    filterTaps?: bool,
    tapsThreshold?: float,
    preventScroll?: bool,
    preventScrollAxis?: [#x | #y | #xy],
    pointer: dragPointer,
    delay?: float,
    swipe?: swipe,
    keyboardDisplacement?: float,
  }
  type useDrag = {...shared, ...drag}

  type move = {
    ...gesture,
    ...xy,
    mouseOnly?: bool,
  }
  type useMove = {...shared, ...move}

  type hover = {...gesture, mouseOnly?: bool}
  type useHover = {...shared, ...hover}

  type scroll = {
    ...gesture,
    ...xy,
  }
  type useScroll = {...shared, ...scroll}

  type wheel = {
    ...gesture,
    ...xy,
  }

  type useWheel = {...shared, ...wheel}

  type pinchPointer = {touch?: bool}
  type pinch = {
    ...gesture,
    scaleBounds?: State.t => scaleBounds,
    angleBounds?: State.t => angleBounds,
    pinchOnWheel?: bool,
    modifierKey?: Nullable.t<array<[#altKey | #ctrlKey | #metaKey]>>,
    pointer: pinchPointer,
  }
  type usePinch = {...shared, ...pinch}

  type useGesture = {
    ...sharedAndGesture,
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

let preventGestures = %raw(`() => {
  document.addEventListener('gesturestart', (e) => e.preventDefault())
  document.addEventListener('gesturechange', (e) => e.preventDefault())
}`)
