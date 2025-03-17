external window: Dom.window = "window"
@get external location: Dom.window => Dom.location = "location"
@get external hash: Dom.location => string = "hash"
@set external setHash: (Dom.location, string) => unit = "hash"
@send
external addEventListener: (Dom.window, string, Dom.event => unit) => unit = "addEventListener"
@send
external removeEventListener: (Dom.window, string, Dom.event => unit) => unit =
  "removeEventListener"

let useHash = () => {
  let (hash_, setHash_) = React.useState(() => window->location->hash)
  let _ = React.useSyncExternalStore(
    ~subscribe=_ => {
      let handleHashChange = _ => {
        setHash_(_ => window->location->hash)
      }
      window->addEventListener("hashchange", handleHashChange)
      () => window->removeEventListener("hashchange", handleHashChange)
    },
    ~getSnapshot=() => window->location->hash,
  )
  let setWindowHash = hash => {
    window->location->setHash(hash)
  }
  (hash_, setWindowHash)
}
