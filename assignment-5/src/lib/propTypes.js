import { PropTypes as T } from "react"

const glyph = T.oneOfType([ T.string, T.number ])

const trajectory = T.shape({
  trajectory : T.string.isRequired,
  id         : T.arrayOf(T.string.isRequired).isRequired,
  i          : T.arrayOf(T.number.isRequired).isRequired,
  date       : T.arrayOf(T.number.isRequired).isRequired,
})

const propTypes = {
  glyph,
  trajectory,
  ...T,
}

export default propTypes
