let _ = (
  async () => {
    switch ReactDOM.querySelector("#root") {
    | Some(domElement) =>
      Elm.Program.dispatch(State.program, State.Initialize)

      ReactDOM.Client.createRoot(domElement)->ReactDOM.Client.Root.render(
        <React.StrictMode>
          <State.Provider value={State.program}>
            <App />
          </State.Provider>
        </React.StrictMode>,
      )
    | None => ()
    }
  }
)()
