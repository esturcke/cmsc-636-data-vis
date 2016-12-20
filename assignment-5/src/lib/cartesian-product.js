import { reduce, flatMap, map } from "lodash/fp"

// Based on https://gist.github.com/tansongyang/9695563ad9f1fa5309b0af8aa6b3e7e3 👀
const product = (...rest) => reduce((a, b) => flatMap(x => map(y => [ ...x, y ])(b))(a))([[]])(rest)

export default product
