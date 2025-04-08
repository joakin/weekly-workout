type vec2 = (float, float)

/**
 * ReScript bindings for the state object provided by @use-gesture.
 * See: [https://use-gesture.netlify.app/docs/state/](https://use-gesture.netlify.app/docs/state/)
 */
module State = {
  /**
   * Base state type containing properties common to most gestures.
   * The `'memo` type parameter allows for a generic memo value.
   */
  type t<'memo, 'args> = {
    // --- Internal properties (prefixed with _) ---
    _active: bool,
    _blocked: bool,
    _intentional: bool,
    _movement: vec2,
    _initial: vec2,
    _lastEventType: option<string>,
    // Using array<int> for simplicity, could be a Set binding if needed.
    _pointerIds: array<int>,
    _touches: int,
    _force: bool, // If pointer events supports force.
    // --- Public properties ---
    /** The originating DOM event. */
    event: Dom.event,
    /** The DOM node target. */
    target: Js.Nullable.t<Dom.eventTarget>,
    /** The DOM node currentTarget. */
    currentTarget: Js.Nullable.t<Dom.eventTarget>,
    /** Args optionally passed to the handler. */
    args: 'args,
    /** Unique pointer identifier. */
    pointerId: option<int>,
    /** Is the gesture active. */
    active: bool,
    /** Is it the first event of the gesture. */
    first: bool,
    /** Is it the last event of the gesture. */
    last: bool,
    /** Memoized value you can assign. */
    memo: Nullable.t<'memo>,
    /** Function to cancel the gesture. */
    cancel: unit => unit,
    /** Was the gesture canceled. */
    canceled: bool,
    /** Gesture start time (ms). */
    startTime: float,
    /** Event timestamp (ms). */
    timeStamp: float,
    /** Time elapsed since gesture start (ms). */
    elapsedTime: float,
    /** Whether the gesture is intentional. */
    intentional: bool,
    /** Current gesture values (e.g., [x, y] for drag, [d, a] for pinch). */
    values: vec2,
    /** Current gesture velocities. */
    velocities: vec2,
    /** Overall velocity. */
    velocity: float,
    /** Displacement since the first event. */
    movement: vec2,
    /** Displacement since the gesture started. */
    offset: vec2,
    /** Delta between the previous and current event. */
    delta: vec2,
    /** Direction per axis. */
    direction: vec2,
    /** Distance traversed since the first event. */
    distance: float,
    /** Coordinates of the first event. */
    initial: vec2,
    /** Coordinates of the previous event. */
    previous: vec2,
    /** Current coordinates. */
    xy: vec2,
    /** Current velocities per axis. */
    vxvy: vec2,
    /** Swipe gesture detected. */
    swipe: vec2,
    /** Number of touches involved. */
    touches: int,
    /** Alias for active. */
    pinching: bool, // Present in pinch state, alias for active
    /** Alias for active. */
    dragging: bool, // Present in drag state, alias for active
    /** Alias for active. */
    moving: bool, // Present in move state, alias for active
    /** Alias for active. */
    scrolling: bool, // Present in scroll state, alias for active
    /** Alias for active. */
    wheeling: bool, // Present in wheel state, alias for active
  }

  /**
   * State type specific to drag gestures. Includes all base properties
   * plus drag-specific ones.
   */
  type drag<'memo, 'args> = {
    ...t<'memo, 'args>,
    // --- Drag specific ---
    /** Is the mouse button down or touch held. */
    down: bool,
    /** Mouse buttons pressed. */
    buttons: int,
    /** Whether the drag is locked to the x / y axis. */
    locked: bool,
  }

  /**
   * State type specific to pinch gestures. Includes all base properties
   * plus pinch-specific ones. Note: `da` (distance, angle) is an alias
   * for `values`, and `vdva` is an alias for `velocities`, so they are
   * accessed via `values` and `velocities` respectively.
   */
  type pinch<'memo, 'args> = {
    ...t<'memo, 'args>,
    // --- Pinch specific ---
    /** The origin of the pinch gesture on the screen. */
    origin: option<vec2>,
  }
}

module Config = {
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
