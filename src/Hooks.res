let useHash = () => {
  let getWindowHash = () => window->Web.location->Web.hash
  let (hash_, setHash_) = React.useState(() => getWindowHash())
  let _ = React.useSyncExternalStore(~subscribe=_ => {
    let handleHashChange = _ => {
      setHash_(_ => getWindowHash())
    }
    window->Web.addEventListener("hashchange", handleHashChange)
    () => window->Web.removeEventListener("hashchange", handleHashChange)
  }, ~getSnapshot=getWindowHash)

  let setWindowHash = hash => {
    window->Web.location->Web.setHash(hash)
  }

  (hash_, setWindowHash)
}

let useRoute = () => {
  let (hash, _) = useHash()
  Route.fromHash(hash)
}
