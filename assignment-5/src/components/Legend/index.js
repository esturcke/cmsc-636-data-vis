import React from "react"
import T     from "~/lib/propTypes"

const Legend = ({ assignSymbol, assignments }) => (
  <div>Legend</div>
)

Legend.propTypes = {
  assignSymbol : T.func.isRequired,
  assignments  : T.object.isRequired,
}

export default Legend
