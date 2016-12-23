import React from "react"
import T     from "~/lib/propTypes"

const context = require.context("./assets/", false, /\.svg$/)

const Glyph = ({ n, ...props }) => React.createElement(context(`./glyph-${n}.svg`), props)

Glyph.propTypes = {
  n : T.string.isRequired,
}

export default Glyph
