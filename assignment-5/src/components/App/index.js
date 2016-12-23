/* eslint-disable react/no-set-state */
import React                       from "react"
import { filter }                  from "lodash"
import { flow, invert, mapValues } from "lodash/fp"
import Legend                      from "~/components/Legend"
import Visualization               from "~/components/Visualization"
import styles                      from "./app.scss"
import trajectories                from "../../../data/trajectories.json"

class App extends React.Component {
  state = {
    assignments : {
      1 : ["headache"   , "depression"],
      2 : ["depression" , "ptsd"      ],
      3 : ["anxiety"    , "depression"],
      4 : ["depression" , "vision"    ],
    },
  }

  assignGlyph = n => trajectory => this.setState(({ assignments }) => ({
    assignments : { ...filter(assignments, t => t !== trajectory), [n] : trajectory },
  }))

  trajectoryGlyphs = () => flow([
    mapValues(([from, to]) => `${from}-${to}`),
    invert,
  ])(this.state.assignments)

  render = () => (
    <div>
      <Legend assignGlyph={this.assignGlyph} assignments={this.state.assignments}/>
      <div className={styles.fill}>
        <Visualization trajectories={trajectories} trajectoryGlyphs={this.trajectoryGlyphs()}/>
      </div>
    </div>
  )
}

export default App
