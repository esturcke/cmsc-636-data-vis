import trajectories from "~/lib/trajectories"

const [,, from, to] = process.argv

const patients = require("../data/ehr.json")
console.log(JSON.stringify(trajectories(from, to)(patients), null, 2))
