import fs                       from "fs"
import { flow, map, mapValues } from "lodash/fp"
import { mergeWith, isArray }   from "lodash"
import trajectories             from "~/lib/trajectories"
import product                  from "~/lib/cartesian-product"
import symptoms                 from "~/lib/symptoms"

const patients = require("../data/ehr.json")

const byIndex = (a, b) => a.i[1] - b.i[1] || a.i[0] - b.i[0]

const sequences       = product(symptoms, symptoms).filter(([from, to]) => from !== to)
const allTrajectories = flow(
  map(([from, to]) => trajectories(from, to)(patients)),
  results => mergeWith(...results, (a, b) => isArray(a) ? a.concat(b) : undefined),
  mapValues(({ trajectories, ...rest }) => ({ ...rest, trajectories : trajectories.sort(byIndex) }))
)(sequences)

fs.writeFileSync(
  "data/trajectories.json",
  JSON.stringify(allTrajectories, null, 2),
)
