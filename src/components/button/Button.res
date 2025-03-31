type styles = {
  button: string,
  primary: string,
  secondary: string,
  success: string,
  disabled: string,
  full_width: string,
}
@module external styles: styles = "./button.module.css"

type variant =
  | Primary
  | Secondary
  | Success
  | Normal

type buttonType =
  | Button
  | Submit
  | Reset

@react.component
let make = (
  ~children: React.element,
  ~onClick: option<JsxEvent.Mouse.t => unit>=?,
  ~variant: variant=Normal,
  ~disabled: bool=false,
  ~fullWidth: bool=false,
  ~className: option<string>=?,
  ~type_: buttonType=Button,
) => {
  let className = {
    let base = styles.button
    let variantClass = switch variant {
    | Primary => styles.primary
    | Secondary => styles.secondary
    | Success => styles.success
    | Normal => ""
    }
    let disabledClass = disabled ? styles.disabled : ""
    let fullWidthClass = fullWidth ? styles.full_width : ""
    let customClass = className->Option.getOr("")
    [base, variantClass, disabledClass, fullWidthClass, customClass]
    ->Array.filter(x => x != "")
    ->Array.join(" ")
  }

  let typeString = switch type_ {
  | Button => "button"
  | Submit => "submit"
  | Reset => "reset"
  }

  <button className={className} ?onClick disabled type_=typeString> {children} </button>
}
