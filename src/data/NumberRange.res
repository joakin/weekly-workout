type t = {
  min: int,
  max?: int,
}

let formatRange = (range: t): string => {
  switch range.max {
  | Some(max) => Int.toString(range.min) ++ "-" ++ Int.toString(max)
  | None => Int.toString(range.min)
  }
}

let fromJson = (json: JSON.t) => {
  let error = () => Error(
    `Parse error: Wanted NumberRange.t, got:\n\n${json->JSON.stringify(~space=2)}`,
  )
  switch json {
  | Object(rangeDict) =>
    switch (Dict.get(rangeDict, "min"), Dict.get(rangeDict, "max")) {
    | (Some(Number(min)), Some(Number(max))) =>
      Ok({min: Int.fromFloat(min), max: Int.fromFloat(max)})
    | (Some(Number(min)), None) => Ok({min: Int.fromFloat(min)})
    | _ => error()
    }
  | _ => error()
  }
}
