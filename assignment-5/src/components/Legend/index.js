import React      from "react"
import { range }  from "d3-array"
import Glyph      from "~/components/Glyph"
import T          from "~/lib/propTypes"
import Assignment from "./Assignment"
import styles     from "./legend.scss"

const Legend = ({ assignGlyph, assignments }) => (
  <ul className={styles.trajectories}>
    {range(1, 17).map(n => <li key={n}>
      <Glyph n={n} transform="scale(0.66)"/> <Assignment assignGlyph={assignGlyph(n)} assignment={assignments[n]}/>
    </li>)}
  </ul>
)

Legend.propTypes = {
  assignGlyph : T.func.isRequired,
  assignments : T.object.isRequired,
}

export default Legend
