let partition = (array: array<result<'ok, 'err>>): (array<'ok>, array<'err>) => {
  let ok = []
  let err = []
  Array.forEach(array, result => {
    switch result {
    | Ok(okItem) => Array.push(ok, okItem)
    | Error(errItem) => Array.push(err, errItem)
    }
  })
  (ok, err)
}

let combine = (array: array<result<'ok, 'err>>): result<array<'ok>, array<'err>> => {
  let (ok, err) = partition(array)
  if Array.length(ok) == Array.length(array) {
    Ok(ok)
  } else {
    Error(err)
  }
}
