/* eslint-disable react/no-set-state */
import React                                              from "react"
import { omitBy, omit, flow, invert, mapValues, isEqual } from "lodash/fp"
import Legend                                             from "~/components/Legend"
import Visualization                                      from "~/components/Visualization"
import styles                                             from "./app.scss"
import trajectories                                       from "../../../data/trajectories.json"

class App extends React.Component {
  state = {
    highlight   : null,
    assignments : {
      1 : [ "depression" , "ptsd"       ],
      2 : [ "anxiety"    , "depression" ],
      3 : [ "depression" , "anxiety"    ],
      4 : [ "sleep"      , "depression" ],
      5 : [ "endocrine"  , "headache"   ],
    },
  }

  assignGlyph = n => trajectory => this.setState(({ assignments }) => ({ assignments : trajectory
    ? { ...omitBy(isEqual(trajectory))(assignments), [n] : trajectory }
    : { ...omit(n)(assignments) },
  }))

  trajectoryGlyphs = () => flow([
    mapValues(([from, to]) => `${from}-${to}`),
    invert,
  ])(this.state.assignments)

  highlightGlyph = (highlight = null) => this.setState({ highlight })

  render = () => (
    <div>
      <Legend
        assignGlyph={this.assignGlyph}
        assignments={this.state.assignments}
        highlightGlyph={this.highlightGlyph}
        highlight={this.state.highlight}
      />
      <div className={styles.fill}>
        <Visualization
          trajectories={trajectories}
          trajectoryGlyphs={this.trajectoryGlyphs()}
          highlightGlyph={this.highlightGlyph}
          highlight={this.state.highlight}
        />
      </div>
    </div>
  )
}

export default App
