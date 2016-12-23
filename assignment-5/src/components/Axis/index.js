import React          from "react"
import { axisBottom } from "d3-axis"
import { select }     from "d3-selection"
import T              from "~/lib/propTypes"

class Axis extends React.Component {
  componentDidMount = () => this.renderAxis()
  componentDidUpdate = () => this.renderAxis()

  renderAxis = () => select(this.axis).call(
    axisBottom(this.props.scale).tickValues(this.props.tickValues)
  )

  render = () => (
    <g className="axis" ref={axis => this.axis = axis} transform={`translate(${this.props.x} ${this.props.y})`}/>
  )
}

Axis.propTypes = {
  scale      : T.func.isRequired,
  tickValues : T.arrayOf(T.number).isRequired,
  x          : T.number.isRequired,
  y          : T.number.isRequired,
}

export default Axis
