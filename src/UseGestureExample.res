Console.log("Hello from UseGestureExample")

module Example = {
  let addStyle = ReactDOM.Style.unsafeAddStyle

  @react.component
  let make = () => {
    let ((x, y), setXY) = React.useState(_ => (0.0, 0.0))

    let bind = UseGesture.React.useDrag(({delta: (dx, dy)}) => {
      setXY(((x, y)) => (x +. dx, y +. dy))
    }, {})

    <div
      {...bind()}
      style={{
        backgroundColor: "papayawhip",
        transform: {
          let x = x->Float.toString
          let y = y->Float.toString
          Console.log(`Transform string: translate(${x}px, ${y}px)`)
          `translate(${x}px, ${y}px)`
        },
      }->addStyle({"touchAction": "none"})}>
      {React.string("Drag me!")}
    </div>
  }
}

switch ReactDOM.querySelector("#root") {
| Some(domElement) =>
  ReactDOM.Client.createRoot(domElement)->ReactDOM.Client.Root.render(
    <React.StrictMode>
      <Example />
    </React.StrictMode>,
  )
| None => ()
}
