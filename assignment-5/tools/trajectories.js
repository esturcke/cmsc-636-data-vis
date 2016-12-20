import { flow, map, mapValues } from "lodash/fp"
import { merge }                from "lodash"
import trajectories             from "~/lib/trajectories"
import product                  from "~/lib/cartesian-product"

const patients = require("../data/ehr.json")
const symptoms = [
  "stress",
  "ptsd",
  "speech",
  "anxiety",
  "depression",
  "headache",
  "sleep",
  "audiology",
  "vision",
  "neurologic",
  "alzheimer",
  "cognitive",
  "pcs",
  "endocrine",
]

const byIndex = (a, b) => a.i[1] - b.i[1] || a.i[0] - b.i[0]

const sequences       = product(symptoms, symptoms).filter(([from, to]) => from !== to)
const allTrajectories = flow(
  map(([from, to]) => trajectories(from, to)(patients)),
  results => merge(...results),
  mapValues(({ trajectories, ...rest }) => ({ ...rest, trajectories : trajectories.sort(byIndex) }))
)(sequences)
console.log(JSON.stringify(allTrajectories, null, 2))
