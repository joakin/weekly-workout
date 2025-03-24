let _ = (
  async () => {
    switch ReactDOM.querySelector("#root") {
    | Some(domElement) =>
      Tea.Program.dispatch(State.program, State.Initialize)

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
