let formatMillis = (millis: Date.msSinceEpoch) => {
  let seconds = Math.floor(millis /. 1000.)
  let minutes = Math.floor(seconds /. 60.)
  let hours = Math.floor(minutes /. 60.)

  let parts = []
  if hours > 0. {
    Array.push(parts, `${hours->Float.toFixed(~digits=0)}h`)
  }
  if minutes > 0. {
    Array.push(parts, `${minutes->Float.toFixed(~digits=0)}m`)
  }
  if seconds > 0. {
    Array.push(parts, `${seconds->Float.toFixed(~digits=0)}s`)
  }

  switch parts {
  | [part] => part
  | [part, part2] => `${part} and ${part2}`
  | [part, part2, part3] => `${part}, ${part2} and ${part3}`
  | _ => panic("Unreachable")
  }
}
