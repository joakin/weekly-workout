type rec t = {
  name: string,
  sets: NumberRange.t,
  reps: NumberRange.t,
  notes: option<string>,
  superset: option<t>,
}
