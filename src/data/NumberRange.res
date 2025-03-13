type t = {
  min: int,
  max: option<int>,
}

let formatRange = (range: t): string => {
  switch range.max {
  | Some(max) => Int.toString(range.min) ++ "-" ++ Int.toString(max)
  | None => Int.toString(range.min)
  }
}
