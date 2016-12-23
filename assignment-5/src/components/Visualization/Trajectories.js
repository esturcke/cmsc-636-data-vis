import React                      from "react"
import { flow, map, filter, has } from "lodash/fp"
import Glyph                      from "~/components/Glyph"
import T                          from "~/lib/propTypes"

const Trajectories = ({ trajectories, trajectoryGlyphs, trajectoryScale }) => (
  <g>{flow([
    filter(({ trajectory }) => has(trajectory)(trajectoryGlyphs)),
    map(({ i, id, trajectory }) => (
      <g key={`${id[1]}-${trajectory}`} transform={`translate(${trajectoryScale(i[1]) - 13} -13) scale(0.66)`} opacity="0.9">
        <Glyph n={trajectoryGlyphs[trajectory]}/>
      </g>
    )),
  ])(trajectories)}</g>
)

Trajectories.propTypes = {
  trajectories     : T.arrayOf(T.trajectory).isRequired,
  trajectoryGlyphs : T.object.isRequired,
  trajectoryScale  : T.func.isRequired,
}

export default Trajectories
