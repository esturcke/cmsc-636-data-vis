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
    <g transform={`translate(${this.props.x} ${this.props.y})`}>
      <text textAnchor="start" fill="#333" x={this.props.padding.left} y={-4}>{this.props.label}</text>
      <g className="axis" ref={axis => this.axis = axis}/>
    </g>
  )
}

Axis.propTypes = {
  scale      : T.func.isRequired,
  tickValues : T.arrayOf(T.number).isRequired,
  label      : T.string.isRequired,
  x          : T.number.isRequired,
  y          : T.number.isRequired,
  padding    : T.shape({
    left   : T.number,
    bottom : T.number,
    right  : T.number,
    top    : T.number,
  }).isRequired,
}

export default Axis
