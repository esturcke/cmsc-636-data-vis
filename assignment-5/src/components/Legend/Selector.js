/* eslint-disable react/no-set-state */
import React      from "react"
import classNames from "classnames"
import { get }    from "lodash"
import T          from "~/lib/propTypes"
import symptoms   from "~/lib/symptoms"
import styles     from "./legend.scss"

const List = ({ selected, onClick }) => (
  <ul>
    {symptoms.map(symptom => (
      <li key={symptom}
        className={classNames({ [styles.selected] : symptom === selected })}
        onClick={() => onClick(symptom)}
      >{symptom}</li>
    ))}
  </ul>
)

List.propTypes = {
  selected : T.string,
  onClick  : T.func.isRequired,
}

class Selector extends React.Component {
  state = {
    from : get(this, "props.assignment[0]"),
    to   : get(this, "props.assignment[1]"),
  }

  setFrom = from => this.setState({ from }, this.update)
  setTo   = to   => this.setState({ to },   this.update)
  update  = ()   => {
    if (this.state.from && this.state.to)
      this.props.assignGlyph([this.state.from, this.state.to])
  }

  render = () => (
    <div className={styles.selector}>
      <List selected={this.state.from} onClick={this.setFrom}/>
      <span>→</span>
      <List selected={this.state.to} onClick={this.setTo}/>
    </div>
  )
}

Selector.propTypes = {
  assignment  : T.arrayOf(T.string),
  assignGlyph : T.func.isRequired,
}

export default Selector
