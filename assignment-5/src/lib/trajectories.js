import { flow, map, keyBy, filter as filterCapped, flatMap, set, chunk } from "lodash/fp"

const filter = filterCapped.convert({ cap : false })

const duplicateIfBoth = (from, to) => encounter => encounter[from] && encounter[to]
  ? [ set(from)(false)(encounter), set(to)(false)(encounter) ]
  : [ encounter ]

const consecutiveDuplicate = (from, to) => (encounter, i, encounters) => encounter[from]
  ? encounters[i + 1] && encounters[i + 1][to]   // keep the last for `from`, but always discard if at the end
  : encounters[i - 1] && encounters[i - 1][from] // keep the first for `to`, but always discard if at the beginning

const pairAsTrajectory = (from, to) => ([encounterFrom, encounterTo]) => ({
  trjectory : `${from}-${to}`,
  id        : [encounterFrom.id, encounterTo.id],
  date      : [encounterFrom.date, encounterTo.date],
  i         : [encounterFrom.i, encounterTo.i],
})

const fromEncounters = (from, to) => flow(
  filter(encounter => encounter[from] || encounter[to]), // only consider `from` or `to`
  flatMap(duplicateIfBoth(from, to)),                    // duplicate encounters that have both with `to` first
  filter(consecutiveDuplicate(from, to)),                // remove consecutive duplicates
  chunk(2),                                              // chunk alternating encounters that are now a from → to
  map(pairAsTrajectory(from, to)),                       // format the trjectory
)

const trajectories = (from, to) => flow(
  map(({ id, injury, encounters }) => ({ id, injury, trajectories : fromEncounters(from, to)(encounters) })),
  keyBy("id"),
)

export default trajectories
