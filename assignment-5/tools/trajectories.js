import { flow, map } from "lodash/fp"
import { merge }     from "lodash"
import trajectories  from "~/lib/trajectories"
import product       from "~/lib/cartesian-product"

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

const sequences       = product(symptoms, symptoms).filter(([from, to]) => from !== to)
const allTrajectories = flow(
  map(([from, to]) => trajectories(from, to)(patients)),
  results => merge(...results),
)(sequences)
console.log(JSON.stringify(allTrajectories, null, 2))
