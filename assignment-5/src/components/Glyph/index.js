import React from "react"
import T     from "~/lib/propTypes"

const context = require.context("./assets/", false, /\.svg$/)

const Glyph = ({ n, ...props }) => React.createElement(context(`./glyph-${n}.svg`), props)

Glyph.propTypes = {
  n : T.oneOfType([T.string, T.number]).isRequired,
}

export default Glyph
