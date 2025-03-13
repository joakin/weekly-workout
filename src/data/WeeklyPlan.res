type day =
  | Monday
  | Tuesday
  | Wednesday
  | Thursday
  | Friday
  | Saturday
  | Sunday

type t = {
  monday: option<string>,
  tuesday: option<string>,
  wednesday: option<string>,
  thursday: option<string>,
  friday: option<string>,
  saturday: option<string>,
  sunday: option<string>,
}
