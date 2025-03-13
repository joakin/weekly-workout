%%raw("import './TestComponent.css'")

@react.component
let make = () => {
  <div className="test-component">
    {React.string("Hello from ReScript!")}
    <p> {React.string("Banana phone")} </p>
  </div>
}
