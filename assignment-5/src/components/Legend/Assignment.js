import React  from "react"
import T      from "~/lib/propTypes"
import styles from "./legend.scss"

const Label = ({ assignment : [ from, to ] }) => (
  <span className={styles.label}>
    <span>{from}</span> → <span>{to}</span>
  </span>
)

Label.propTypes = {
  assignment : T.arrayOf(T.string).isRequired,
}

class Assignment extends React.Component {

  render = () => (
    <span>
      <span className={styles.target}/>
      {this.props.assignment ? <Label assignment={this.props.assignment}/> : null}
    </span>
  )
}

Assignment.propTypes = {
  assignGlyph : T.func.isRequired,
  assignment  : T.arrayOf(T.string),
}

export default Assignment
