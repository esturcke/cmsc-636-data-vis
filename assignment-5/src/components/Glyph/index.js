import React from "react"
import T     from "~/lib/propTypes"

const context = require.context("./assets/", false, /\.svg$/)

const Glyph = ({ n }) => React.createElement(context(`./glyph-${n}.svg`))

Glyph.propTypes = {
  n : T.number.isRequired,
}

export default Glyph
