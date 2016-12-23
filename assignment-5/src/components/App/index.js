/* eslint-disable react/no-set-state */
import React              from "react"
import { invert, filter } from "lodash"
import Legend             from "~/components/Legend"
import Visualization      from "~/components/Visualization"
import styles             from "./app.scss"
import trajectories       from "../../../data/trajectories.json"

class App extends React.Component {
  state = {
    assignments : {
      0 : "headache-depression",
      1 : "depression-ptsd",
      2 : "anxiety-depression",
    },
  }

  assignSymbol = (symbol, trajectory) => this.setState(({ assignments }) => ({
    assignments : { ...filter(assignments, t => t !== trajectory), symbol : trajectory },
  }))

  trajectorySymbols = () => invert(this.state.assignments)

  render = () => (
    <div>
      <Legend assignSymbol={this.assignSymbol} assignments={this.state.assignments}/>
      <div className={styles.fill}>
        <Visualization trajectories={trajectories} trajectorySymbols={this.trajectorySymbols()}/>
      </div>
    </div>
  )
}

export default App
