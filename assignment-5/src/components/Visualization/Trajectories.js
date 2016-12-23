import React                      from "react"
import { flow, map, filter, has } from "lodash/fp"
import T                          from "~/lib/propTypes"

const Trajectories = ({ trajectories, trajectorySymbols, trajectoryScale }) => (
  <g>{flow([
    filter(a => a),
    map(({ id, trajectory }) => (
      <g key={`${id[0]}-${trajectory}`} transform={`translate(0 0)`}>
      </g>
    )),
  ])(trajectories)}</g>
)

Trajectories.propTypes = {
  trajectories      : T.arrayOf(T.trajectory).isRequired,
  trajectorySymbols : T.object.isRequired,
  trajectoryScale   : T.any.isRequired,
}

export default Trajectories
