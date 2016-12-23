import React      from "react"
import Dimensions from "react-dimensions"
import T          from "~/lib/propTypes"

const Visualization = ({ trajectories, trajectorySymbols, containerWidth, containerHeight }) => (
  <svg width={containerWidth} height={containerHeight}>
    Vis
  </svg>
)

Visualization.propTypes = {
  trajectories      : T.object.isRequired,
  trajectorySymbols : T.object.isRequired,
  containerWidth    : T.number.isRequired,
  containerHeight   : T.number.isRequired,
}

export default Dimensions({ debounce : 50 })(Visualization)
