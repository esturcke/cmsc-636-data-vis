/* eslint-disable react/no-set-state */
import React    from "react"
import Popover  from "react-popover"
import Remove   from "~/assets/remove.svg"
import T        from "~/lib/propTypes"
import Selector from "./Selector"
import styles   from "./legend.scss"

const Label = ({ assignment : [ from, to ] }) => (
  <span className={styles.label}>
    <span>{from}</span> → <span>{to}</span>
  </span>
)

Label.propTypes = {
  assignment : T.arrayOf(T.string).isRequired,
}

class Assignment extends React.Component {
  state = {
    open : false,
  }

  toggleOpen = () => this.setState(({ open }) => ({ open : !open }))

  render = () => (
    <span>
      <Popover
        isOpen={this.state.open}
        place="left"
        body={<Selector assignment={this.props.assignment} assignGlyph={this.props.assignGlyph}/>}
        onOuterAction={this.toggleOpen}
      >
        <span className={styles.target} onClick={this.toggleOpen}>
          {this.props.assignment ? <Remove className={styles.remove} onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            this.props.assignGlyph()
          }}/> : null}
        </span>
      </Popover>
      {this.props.assignment ? <Label assignment={this.props.assignment}/> : null}
    </span>
  )
}

Assignment.propTypes = {
  assignGlyph : T.func.isRequired,
  assignment  : T.arrayOf(T.string),
}

export default Assignment
