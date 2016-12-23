import React        from "react"
import { map }      from "lodash/fp"
import Trajectories from "./Trajectories"
import T            from "~/lib/propTypes"

const Patients = ({ trajectories, trajectorySymbols, patientScale, trajectoryScale }) => (
  <g>{map(({ id, trajectories }) => (
    <g key={id} transform={`translate(0 ${patientScale(id)})`}>
      <Trajectories
        trajectories={trajectories}
        trajectorySymbols={trajectorySymbols}
        trajectoryScale={trajectoryScale}
      />
  </g>
  ))(trajectories)}</g>
)

Patients.propTypes = {
  trajectories      : T.object.isRequired,
  trajectorySymbols : T.object.isRequired,
  patientScale      : T.func.isRequired,
  trajectoryScale   : T.func.isRequired,
}

export default Patients
