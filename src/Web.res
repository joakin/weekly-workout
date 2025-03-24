external window: Dom.window = "window"
@get external location: Dom.window => Dom.location = "location"
@get external hash: Dom.location => string = "hash"
@set external setHash: (Dom.location, string) => unit = "hash"
@send
external addEventListener: (Dom.window, string, Dom.event => unit) => unit = "addEventListener"
@send
external removeEventListener: (Dom.window, string, Dom.event => unit) => unit =
  "removeEventListener"
