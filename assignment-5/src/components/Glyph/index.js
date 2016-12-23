import React      from "react"
import classNames from "classnames"
import T          from "~/lib/propTypes"
import styles     from "./glyph.scss"

const context = require.context("./assets/", false, /\.svg$/)

const Glyph = ({ n, highlight, ...props }) => React.createElement(context(`./glyph-${n}.svg`), {
  ...props,
  className : classNames({[styles.highlight] : highlight == n }),
})

Glyph.propTypes = {
  n         : T.oneOfType([T.string, T.number]).isRequired,
  highlight : T.glyph,
}

export default Glyph
