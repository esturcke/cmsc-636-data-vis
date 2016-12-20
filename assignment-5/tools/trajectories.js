import fs from "fs"
import trajectories from "~/lib/trajectories"

const [,, from, to] = process.argv

trajectories()



console.log(from)
console.log(to)
