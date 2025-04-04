module Day = {
  type t =
    | Monday
    | Tuesday
    | Wednesday
    | Thursday
    | Friday
    | Saturday
    | Sunday

  let fromString = (str: string) => {
    switch String.toLowerCase(str) {
    | "monday" => Some(Monday)
    | "tuesday" => Some(Tuesday)
    | "wednesday" => Some(Wednesday)
    | "thursday" => Some(Thursday)
    | "friday" => Some(Friday)
    | "saturday" => Some(Saturday)
    | "sunday" => Some(Sunday)
    | _ => None
    }
  }

  let toString = (day: t) => {
    switch day {
    | Monday => "Monday"
    | Tuesday => "Tuesday"
    | Wednesday => "Wednesday"
    | Thursday => "Thursday"
    | Friday => "Friday"
    | Saturday => "Saturday"
    | Sunday => "Sunday"
    }
  }

  let today = () => {
    let dayOfWeek: string = %raw(`
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
      })
    `)
    switch fromString(dayOfWeek) {
    | Some(day) => day
    | None => panic(`Invalid day of the week ${dayOfWeek}`)
    }
  }

  let next = (day: t) => {
    switch day {
    | Monday => Tuesday
    | Tuesday => Wednesday
    | Wednesday => Thursday
    | Thursday => Friday
    | Friday => Saturday
    | Saturday => Sunday
    | Sunday => Monday
    }
  }

  let prev = (day: t) => {
    switch day {
    | Monday => Sunday
    | Tuesday => Monday
    | Wednesday => Tuesday
    | Thursday => Wednesday
    | Friday => Thursday
    | Saturday => Friday
    | Sunday => Saturday
    }
  }
}

type t = {
  monday?: string,
  tuesday?: string,
  wednesday?: string,
  thursday?: string,
  friday?: string,
  saturday?: string,
  sunday?: string,
}

let get = (plan: t, day: Day.t) => {
  switch day {
  | Monday => plan.monday
  | Tuesday => plan.tuesday
  | Wednesday => plan.wednesday
  | Thursday => plan.thursday
  | Friday => plan.friday
  | Saturday => plan.saturday
  | Sunday => plan.sunday
  }
}

let rec next = (plan: t, day: Day.t, ~skipRestDays: bool=false) => {
  let nextDay = Day.next(day)
  switch get(plan, nextDay) {
  | Some(_) => nextDay
  | None if skipRestDays => next(plan, nextDay)
  | None => nextDay
  }
}

let rec prev = (plan: t, day: Day.t, ~skipRestDays: bool=false) => {
  let prevDay = Day.prev(day)
  switch get(plan, prevDay) {
  | Some(_) => prevDay
  | None if skipRestDays => prev(plan, prevDay)
  | None => prevDay
  }
}
