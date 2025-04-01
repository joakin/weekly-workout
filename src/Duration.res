let formatMillis = (millis: Date.msSinceEpoch) => {
  let totalSeconds = Int.fromFloat(millis /. 1000.)
  let hours = totalSeconds / (60 * 60)
  let minutes = mod(totalSeconds, 60 * 60) / 60
  let seconds = mod(totalSeconds, 60)

  let parts = []
  if hours > 0 {
    Array.push(parts, `${hours->Int.toString}h`)
  }
  if minutes > 0 {
    Array.push(parts, `${minutes->Int.toString}m`)
  }
  if seconds > 0 {
    Array.push(parts, `${seconds->Int.toString}s`)
  }

  switch parts {
  | [part] => part
  | [part, part2] => `${part} and ${part2}`
  | [part, part2, part3] => `${part}, ${part2} and ${part3}`
  | [] => "0s"
  | _ => panic("Unreachable")
  }
}
