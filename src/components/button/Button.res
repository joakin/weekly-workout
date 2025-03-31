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

@react.component
let make = (
  ~children: React.element,
  ~onClick: unit => unit,
  ~variant: variant=Normal,
  ~disabled: bool=false,
  ~fullWidth: bool=false,
  ~className: option<string>=?,
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

  <button className={className} onClick={_ => onClick()} disabled> {children} </button>
}
