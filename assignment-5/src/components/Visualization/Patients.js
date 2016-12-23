import React        from "react"
import { map }      from "lodash/fp"
import Trajectories from "./Trajectories"
import T            from "~/lib/propTypes"

const Patients = ({ trajectories, trajectoryGlyphs, patientScale, trajectoryScale }) => (
  <g>
    <text fill="black" x={-10} y={18} textAnchor="end" transform="rotate(-90)">patients ordered by age at time of injury</text>
    {map(({ id, injury : { age }, trajectories }) => (
      <g key={id} transform={`translate(0 ${patientScale(id)})`}>
        <text fill="black" x={40} y={3} textAnchor="end">{age}</text>
        <Trajectories
          trajectories={trajectories}
          trajectoryGlyphs={trajectoryGlyphs}
          trajectoryScale={trajectoryScale}
        />
      </g>
    ))(trajectories)}
  </g>
)

Patients.propTypes = {
  trajectories     : T.object.isRequired,
  trajectoryGlyphs : T.object.isRequired,
  patientScale     : T.func.isRequired,
  trajectoryScale  : T.func.isRequired,
}

export default Patients
