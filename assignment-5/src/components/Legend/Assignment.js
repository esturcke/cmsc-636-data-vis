import React from "react"
import T     from "~/lib/propTypes"


class Assignment extends React.Component {

  render = () => (
    <div>
      {this.props.assignment ? <span>{this.props.assignment[0]} → {this.props.assignment[1]}</span> : null}
    </div>
  )
}

Assignment.propTypes = {
  assignGlyph : T.func.isRequired,
  assignment  : T.arrayOf(T.string),
}

export default Assignment
