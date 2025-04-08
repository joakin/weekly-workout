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

/** Module containing configuration types for use-gesture hooks. */
module Config = {
  /** Represents the target for the gesture (DOM node or React ref). */
  module Target = {
    type t
    external node: Dom.node => t = "%identity"
    external ref: React.ref<React.element> => t = "%identity"
  }

  /**
   * Lets you customize if you want events to be passive or captured.
   * React note: If you want events not to be passive, you will need to attach
   * events directly to a node using `target` because of the way React handles
   * events.
   */
  type eventOptions = {
    /** Sets whether events are passive. Default: true */
    passive?: bool,
    /** When set to true, events will be captured. Default: false */
    capture?: bool,
  }

  /** Limits the gesture offset to the specified bounds. */
  type bounds = {top?: float, bottom?: float, left?: float, right?: float}

  /** Limits the scale offset to the specified bounds. */
  type scaleBounds = {min?: float, max?: float}
  /** Limits the angle offset to the specified bounds. */
  type angleBounds = {min?: float, max?: float}

  /** Common options shared between the main config and gesture-specific configs. */
  type sharedAndGesture = {
    /** When set to false none of your handlers will be fired. Default: true */
    enabled?: bool,
    /** Lets you customize if you want events to be passive or captured. */
    eventOptions?: eventOptions,
  }

  /** Common options applicable at the top level of the configuration. */
  type shared = {
    /** Lets you specify a DOM node or React ref you want to attach the gesture to. */
    target?: Target.t,
    /** Lets you specify which window element the gesture should bind events to (only relevant for drag gesture). Default: window */
    window?: Dom.window,
  }

  /** Base configuration options applicable to most gestures. */
  type gesture<'memo, 'args> = {
    ...sharedAndGesture,
    /** The initial position offset the gesture should start from. */
    from?: State.t<'memo, 'args> => vec2, // Note: Docs say vec2 or function, binding uses function only
    /** The handler will fire only when the gesture displacement is greater than the threshold. Default: [0, 0] */
    threshold?: vec2,
    /** If true, prevents default browser behavior for events triggered by the handler. Default: false */
    preventDefault?: bool,
    /** Forces the handler to fire even for non-intentional displacement (ignores threshold). `intentional` state remains false until threshold is reached. Default: false */
    triggerAllEvents?: bool,
    /** Your handler will only trigger if movement is detected on the specified axis. `lock` restricts movement to the first axis detected. */
    axis?: [#lock | #x | #y],
    /** Elasticity coefficient when going out of bounds. `true` defaults to 0.15. `false` or `0` disables. Default: false */
    rubberband?: vec2, // Note: Docs say boolean or number/vec2, binding uses vec2
    /** Function to transform pointer values (e.g., map screen coordinates to custom space). */
    transform?: vec2 => vec2,
  }

  /** Configuration options specific to XY-based gestures (move, scroll, wheel). */
  type xy<'memo, 'args> = {
    /** Axes are calculated based on a threshold. Default: 0 */
    axisThreshold?: float,
    /** Limits the gesture offset to the specified bounds. */
    bounds?: State.t<'memo, 'args> => bounds,
  }

  /** Thresholds per device type for drag gestures to determine axis lock. */
  type dragAxisThreshold = {mouse: float, pen: float, touch: float} // Default: { mouse: 0, pen: 0, touch: 0 }

  /** Pointer-related options for drag gestures. */
  type dragPointer = {
    /** If true, use touch events on touch-enabled devices. Default: false */
    touch?: bool,
    /** If false, don't use setPointerCapture; attach pointerMove events to the window. Default: true */
    capture?: bool,
    /** Combination of buttons that triggers the drag gesture. Default: [1] (left-click) */
    buttons?: array<float>,
    /** If true, the pointer enters pointer lock mode on drag start and exits on end. Default: false */
    lock?: bool,
    /** If you set keys to false, your drag handler won't respond to keyboard
     * events (shift to accelerate 10x, alt to slow down 10x). Default: true */
    keys?: bool,
  }
  /** Configuration for swipe detection within a drag gesture. */
  type swipe = {
    /** Minimum distance per axis (px) to trigger a swipe. Default: [60, 60] */
    distance?: vec2,
    /** The maximum duration in milliseconds that a swipe is detected. Default: 250 */
    duration?: float,
    /** Minimum velocity per axis (px/ms) to trigger a swipe. Default: [0.5, 0.5] */
    velocity?: vec2,
  }
  /** Configuration options specific to the drag gesture. */
  type drag<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    /** Thresholds per device type to determine axis lock. */
    axisThreshold?: dragAxisThreshold,
    /** If true, prevents drag logic trigger on simple clicks. Default: false */
    filterTaps?: bool,
    /** Displacement threshold (px) for tap filtering. Default: 3 */
    tapsThreshold?: float,
    /** Experimental: If set (ms), drag triggers after delay, preventing window scroll. `true` defaults to 250ms. Default: false */
    preventScroll?: float,
    /** Allows scrolling on the specified axis until `preventScroll` delay elapses. Default: #y */
    preventScrollAxis?: [#x | #y | #xy],
    /** Pointer-related options for drag. */
    pointer?: dragPointer,
    /** Delays handler execution (ms or true). `true` defaults to 180ms. Default: false */
    delay?: float,
    /** Swipe detection configuration. */
    swipe?: swipe,
    /** Distance (px) emulated by arrow keys for keyboard dragging. Default: 10 */
    keyboardDisplacement?: float,
  }
  /** Full configuration for the `useDrag` hook. */
  type useDrag<'memo, 'args> = {...shared, ...drag<'memo, 'args>}

  /** Configuration options specific to the move gesture. */
  type move<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    ...xy<'memo, 'args>,
    /** If false, allows triggering on non-mouse events (e.g., touch). Default: true */
    mouseOnly?: bool,
  }
  /** Full configuration for the `useMove` hook. */
  type useMove<'memo, 'args> = {...shared, ...move<'memo, 'args>}

  /** Configuration options specific to the hover gesture. */
  type hover<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    /** If false, allows triggering on non-mouse events. Default: true */
    mouseOnly?: bool,
  }
  /** Full configuration for the `useHover` hook. */
  type useHover<'memo, 'args> = {...shared, ...hover<'memo, 'args>}

  /** Configuration options specific to the scroll gesture. */
  type scroll<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    ...xy<'memo, 'args>,
  }
  /** Full configuration for the `useScroll` hook. */
  type useScroll<'memo, 'args> = {...shared, ...scroll<'memo, 'args>}

  /** Configuration options specific to the wheel gesture. */
  type wheel<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    ...xy<'memo, 'args>,
  }
  /** Full configuration for the `useWheel` hook. */
  type useWheel<'memo, 'args> = {...shared, ...wheel<'memo, 'args>}

  /** Pointer-related options for pinch gestures. */
  type pinchPointer = {
    /** If true, use touch events on touch-enabled devices. Default: false */
    touch?: bool,
  }
  /** Configuration options specific to the pinch gesture. */
  type pinch<'memo, 'args> = {
    ...gesture<'memo, 'args>,
    /** Limits the scale offset. */
    scaleBounds?: State.t<'memo, 'args> => scaleBounds,
    /** Limits the angle offset. */
    angleBounds?: State.t<'memo, 'args> => angleBounds,
    /** If false, disables pinching with the wheel. Default: true */
    pinchOnWheel?: bool,
    /** Modifier key(s) that trigger scale when wheeling. `null` disables. Default: `Some([#ctrlKey])` */
    modifierKey?: Nullable.t<array<[#altKey | #ctrlKey | #metaKey]>>,
    /** Pointer-related options for pinch. Default: { touch: false } */
    pointer: pinchPointer,
  }
  /** Full configuration for the `usePinch` hook. */
  type usePinch<'memo, 'args> = {...shared, ...pinch<'memo, 'args>}

  /** Combined configuration for the generic `useGesture` hook. */
  type useGesture<'memo, 'args> = {
    ...sharedAndGesture,
    ...shared,
    /** Drag gesture specific configuration. */
    drag?: drag<'memo, 'args>,
    /** Move gesture specific configuration. */
    move?: move<'memo, 'args>,
    /** Hover gesture specific configuration. */
    hover?: hover<'memo, 'args>,
    /** Scroll gesture specific configuration. */
    scroll?: scroll<'memo, 'args>,
    /** Wheel gesture specific configuration. */
    wheel?: wheel<'memo, 'args>,
    /** Pinch gesture specific configuration. */
    pinch?: pinch<'memo, 'args>,
  }
}

module React = {
  @module("@use-gesture/react")
  external useDrag: (
    State.drag<'memo, 'args> => unit,
    Config.useDrag<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useDrag"

  @module("@use-gesture/react")
  external useMove: (
    State.t<'memo, 'args> => unit,
    Config.useMove<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useMove"

  @module("@use-gesture/react")
  external useHover: (
    State.t<'memo, 'args> => unit,
    Config.useHover<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useHover"

  @module("@use-gesture/react")
  external useScroll: (
    State.t<'memo, 'args> => unit,
    Config.useScroll<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useScroll"

  @module("@use-gesture/react")
  external useWheel: (
    State.t<'memo, 'args> => unit,
    Config.useWheel<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useWheel"

  @module("@use-gesture/react")
  external usePinch: (
    State.pinch<'memo, 'args> => unit,
    Config.usePinch<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "usePinch"

  // TODO: Missing native dom handlers which this stuff enriches, see
  // https://use-gesture.netlify.app/docs/gestures/#native-event-handlers-in-react
  type useGestureCallbacks<'memo, 'args> = {
    onDrag?: State.drag<'memo, 'args> => unit,
    onDragStart?: State.drag<'memo, 'args> => unit,
    onDragEnd?: State.drag<'memo, 'args> => unit,
    onPinch?: State.pinch<'memo, 'args> => unit,
    onPinchStart?: State.pinch<'memo, 'args> => unit,
    onPinchEnd?: State.pinch<'memo, 'args> => unit,
    onScroll?: State.t<'memo, 'args> => unit,
    onScrollStart?: State.t<'memo, 'args> => unit,
    onScrollEnd?: State.t<'memo, 'args> => unit,
    onMove?: State.t<'memo, 'args> => unit,
    onMoveStart?: State.t<'memo, 'args> => unit,
    onMoveEnd?: State.t<'memo, 'args> => unit,
    onWheel?: State.t<'memo, 'args> => unit,
    onWheelStart?: State.t<'memo, 'args> => unit,
    onWheelEnd?: State.t<'memo, 'args> => unit,
    onHover?: State.t<'memo, 'args> => unit,
  }
  @module("@use-gesture/react")
  external useGesture: (
    useGestureCallbacks<'memo, 'args>,
    Config.useGesture<'memo, 'args>,
  ) => 'args => ReactDOM.domProps = "useGesture"

  // HELPERS
  let touchAction = (
    styles: ReactDOM.Style.t,
    value: [
      | #auto
      | #none
      | #"pan-x"
      | #"pan-left"
      | #"pan-right"
      | #"pan-y"
      | #"pan-up"
      | #"pan-down"
      | #"pinch-zoom"
      | #manipulation
    ],
  ) => {
    ReactDOM.Style.unsafeAddStyle(styles, {"touchAction": value})
  }
}

let preventGestures = %raw(`() => {
  document.addEventListener('gesturestart', (e) => e.preventDefault())
  document.addEventListener('gesturechange', (e) => e.preventDefault())
}`)
