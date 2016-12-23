import React                         from "react"
import Dimensions                    from "react-dimensions"
import { flow, orderBy, map, keys }  from "lodash/fp"
import { scaleOrdinal, scaleLinear } from "d3-scale"
import { range }                     from "d3-array"
import Patients                      from "./Patients"
import T                             from "~/lib/propTypes"

const patientScale = (trajectories, height) => {
  const n = keys(trajectories).length
  return scaleOrdinal()
    .domain(flow([
      orderBy("injury.age")("desc"),
      map("id"),
    ])(trajectories))
    .range(range(n).map(i => i * height / n))
}

const trajectoryScale = width => scaleLinear().domain([-250, 350]).range([0, width])

const Visualization = ({ trajectories, trajectorySymbols, containerWidth, containerHeight }) => (
  <svg width={containerWidth} height={containerHeight}>
    <Patients
      trajectories={trajectories}
      trajectorySymbols={trajectorySymbols}
      patientScale={patientScale(trajectories, containerHeight)}
      trajectoryScale={trajectoryScale(containerWidth)}
    />
  </svg>
)

Visualization.propTypes = {
  trajectories      : T.object.isRequired,
  trajectorySymbols : T.object.isRequired,
  containerWidth    : T.number.isRequired,
  containerHeight   : T.number.isRequired,
}

export default Dimensions({ debounce : 50 })(Visualization)
