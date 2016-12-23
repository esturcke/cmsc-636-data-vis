import React from "react"
import T from "~/lib/propTypes"

const Visualization = ({ trajectories, trajectorySymbols }) => (
  <div>Vis</div>
)

Visualization.propTypes = {
  trajectories      : T.object.isRequired,
  trajectorySymbols : T.object.isRequired,
}

export default Visualization
