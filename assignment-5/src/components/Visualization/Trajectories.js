import React                      from "react"
import { flow, map, filter, has } from "lodash/fp"
import Glyph                      from "~/components/Glyph"
import T                          from "~/lib/propTypes"

const Trajectories = ({ trajectories, trajectorySymbols, trajectoryScale }) => (
  <g>{flow([
    filter(({ trajectory }) => has(trajectory)(trajectorySymbols)),
    map(({ i, id, trajectory }) => (
      <g key={`${id[1]}-${trajectory}`} transform={`translate(${trajectoryScale(i[1])} 0)`} opacity="0.9">
        <Glyph n={trajectorySymbols[trajectory]}/>
      </g>
    )),
  ])(trajectories)}</g>
)

Trajectories.propTypes = {
  trajectories      : T.arrayOf(T.trajectory).isRequired,
  trajectorySymbols : T.object.isRequired,
  trajectoryScale   : T.func.isRequired,
}

export default Trajectories
