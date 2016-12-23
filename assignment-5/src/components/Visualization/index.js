import React                         from "react"
import Dimensions                    from "react-dimensions"
import { flow, orderBy, map, keys }  from "lodash/fp"
import { scaleOrdinal, scaleLinear } from "d3-scale"
import { range }                     from "d3-array"
import Axis                          from "~/components/Axis"
import Patients                      from "./Patients"
import T                             from "~/lib/propTypes"

const padding = {
  top    : 15,
  right  : 15,
  bottom : 25,
  left   : 50,
}

const patientScale = (trajectories, height) => {
  const n = keys(trajectories).length
  return scaleOrdinal()
    .domain(flow([
      orderBy("injury.age")("desc"),
      map("id"),
    ])(trajectories))
    .range(range(n).map(i => padding.top + i * (height - padding.top - padding.bottom) / n))
}

const trajectoryScale = width => scaleLinear().domain([-250, 350]).range([padding.left, width - padding.right - padding.left])

const Visualization = ({ trajectories, trajectoryGlyphs, containerWidth, containerHeight }) => {
  const x = trajectoryScale(containerWidth)
  return (
    <svg width={containerWidth} height={containerHeight}>
      <Axis x={0} y={containerHeight - 20}
        padding={padding}
        label="encounter since TBI"
        scale={x}
        tickValues={[-200, -100, 0, 100, 200, 300]}
      />
      <path d={`M ${x(0)} ${padding.top} l 0 ${containerHeight - padding.top - padding.bottom}`} stroke="#ccc" strokeWidth={0.5}/>
      <Patients
        trajectories={trajectories}
        trajectoryGlyphs={trajectoryGlyphs}
        patientScale={patientScale(trajectories, containerHeight)}
        trajectoryScale={x}
      />
    </svg>
  )
}

Visualization.propTypes = {
  trajectories     : T.object.isRequired,
  trajectoryGlyphs : T.object.isRequired,
  containerWidth   : T.number.isRequired,
  containerHeight  : T.number.isRequired,
}

export default Dimensions({ debounce : 50 })(Visualization)
