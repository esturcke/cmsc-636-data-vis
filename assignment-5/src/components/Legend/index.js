import React      from "react"
import { times }  from "lodash"
import Glyph      from "~/components/Glyph"
import T          from "~/lib/propTypes"
import Assignment from "./Assignment"
import styles     from "./legend.scss"

const Legend = ({ assignGlyph, assignments, highlightGlyph, highlight }) => (
  <ul className={styles.trajectories}>
    {times(16, n => n + 1).map(n => <li key={n} onMouseEnter={() => highlightGlyph(n)} onMouseOut={() => highlightGlyph()}>
      <Glyph n={n} transform="scale(0.66)" highlight={highlight}/> <Assignment assignGlyph={assignGlyph(n)} assignment={assignments[n]}/>
    </li>)}
  </ul>
)

Legend.propTypes = {
  assignGlyph    : T.func.isRequired,
  assignments    : T.object.isRequired,
  highlightGlyph : T.func.isRequired,
  highlight      : T.glyph,
}

export default Legend
