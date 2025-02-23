"use strict"

/* global d3 */

// patient data source
const data = "https://gist.githubusercontent.com/esturcke/2c0a1dcfa6bce8e37f697e8525c814c2/raw/aa86bdba4c69c22b0635e46e16906c0dc8693797/ehr.json"

// SVG area dimensions
const area   = [960, 960]
const margin = { top : 40, right : 40, bottom : 100, left : 60 }
const height = area[1] - margin.top  - margin.bottom
const width  = area[0] - margin.left - margin.right

// Set up canvas
const translate = (x, y) => `translate(${x} ${y})`
const to        = (xVal, yVal) => datum => translate(x(xVal(datum)), y(yVal(datum)))
const svg = d3.select("body").append("svg")
  .attr("width", area[0])
  .attr("height", area[1])
  .append("g").attrs({
    transform : translate(margin.left, margin.top),
  })

// setup x- and y-axis scales and value selectors
const x = d3.scaleLinear().range([0, width]).nice()
const y = d3.scaleLinear().range([height, 0]).nice()

// time conversion
const msInYears = t => t / 1000 / 3600 / 24 / 365.25

// derived data
const injuryAge       = ({ patient }) => patient.injury.age
const encounterAge    = ({ encounter }) => encounter.age
const yearsFromInjury = ({ patient : { injury }, encounter }) => msInYears(encounter.date - injury.date)
const index           = ({ patient : { i } }) => i

const birthScale = d3.scaleLinear().range([-3, 3]).domain([-1, 1])
const encounter = ({ patient : { birthDate }, encounter : { birthDateRange } }, i, nodes) => {
  const current = d3.select(nodes[i])
  const yTop    = birthScale(msInYears(birthDateRange[0] - birthDate))
  const yBottom = birthScale(msInYears(birthDateRange[1] - birthDate))
  current.append("line").attrs({ class : "birth-range", x1 : -3, x2 : 3, y1 : yTop, y2 : yTop })
  current.append("line").attrs({ class : "birth-range", x1 : -3, x2 : 3, y1 : yBottom, y2 : yBottom })
}

const bandLabel = ({ min, max, y1, y2 }, i, nodes) => {
  const node = d3.select(nodes[i])
  const tick = 5
  node.append("path").attrs({
    fill   : "none",
    stroke : "#000",
    d      : `M ${tick} 0 L 0 0 L 0 ${y2 - y1} L ${tick} ${y2 - y1}`,
  })
  node.append("text").text(`${min}–${max}`).attrs({
    "text-anchor" : "middle",
    transform     : `translate(-8 ${(y2 - y1) / 2}) rotate(-90)`,
  })
}

d3.json(data, (error, data) => {
  if (error) throw error

  x.domain([
    d3.min(data, ({ patient }) => d3.min(patient.encounters, encounter => yearsFromInjury({ patient, encounter }))),
    d3.max(data, ({ patient }) => d3.max(patient.encounters, encounter => yearsFromInjury({ patient, encounter }))),
  ])
  y.domain([d3.min(data, index), d3.max(data, index)])

  // set up age bands
  const ageBands = [
    [ 0,  9],
    [10, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
  ].map(([min, max]) => {
    const inBand = data.filter(patient => min <= injuryAge(patient) && injuryAge(patient) <= max)
    const i1 = index(inBand[inBand.length - 1]) + 0.5
    const i2 = index(inBand[0]) - 0.5
    const y1 = y(i1)
    const y2 = y(i2)
    return { min, max, y1, y2 }
  })

  const bands = svg.append("g").attrs({ class : "bands" })
  ageBands.forEach(({ y1, y2 }) => {
    bands.append("rect").attrs({
      x      : -25,
      width  : width + 50,
      y      : y1,
      height : y2 - y1,
    })
  })

  // add vertical line for time of injury
  svg.append("line").attrs({
    class : "injury-line",
    x1    : x(0),
    y1    : -18,
    x2    : x(0),
    y2    : height + 30,
  })

  // join patients and create groups for each
  const patients = svg.selectAll(".patient")
    .data(data)
    .enter()
    .append("g").attrs({
      class : "patient",
    })

  // join encounters and create a circle for each
  patients.selectAll(".encounter")
    .data(({ patient }) => patient.encounters.map(encounter => ({ patient, encounter })))
    .enter()
    .append("g").attrs({
      transform : to(yearsFromInjury, index),
    })
    .each(encounter)

  // set up x-axis
  svg.append("g")
    .attrs({ transform : translate(0, height + 48) })
    .call(d3.axisBottom(x))

  // add fixed legend and y-axis
  const fixed = d3.select("body").append("svg").classed("fixed", true).attrs({
    width  : 500,
    height : area[1],
  })
  .append("g").attrs({
    transform : translate(50, margin.top),
  })

  fixed.append("rect")
    .attrs({
      class  : "mask",
      x      : -margin.left,
      y      : -margin.top,
      height : height + margin.top,
      width  : margin.left + 10,
    })

  fixed.append("text")
    .text("Years before/after injury")
    .attrs({
      class     : "label",
      transform : translate(30, height + 42),
    })

  fixed.append("text")
    .text("Age at time of injury")
    .attrs({
      transform : `translate(-12 ${height}) rotate(-90)`,
    })

  fixed.selectAll(".band-label")
    .data(ageBands)
    .enter()
    .append("g").attrs({
      class : "band-label",
      transform : ({ y1 }) => translate(10, y1),
    })
    .each(bandLabel)

  const legend = fixed.append("g").attrs({
    class     : "legend",
    transform : translate(20, height - 30),
  })
  legend.append("rect").attrs({
    x         : 0,
    y         : 0,
    width     : 280,
    height    : 32,
  })
  legend.append("text").text("One year window relative to estimated birth date").attrs({ class : "legend-label", transform : translate(5, 12) })
  legend.append("g").attrs({ transform : translate(70, 8) }).selectAll("encounter").data([1, 3, 5, 6, 12, 15, 19]).enter()
    .append("line").attrs({ class : "encounter", x1 : x => x, x2 : x => x, y1 : -5, y2 : 5 })
  legend.append("line").attrs({ transform : translate(10, 22), class : "birth-range", x1 : -6, x2 : 6, y1 : birthScale(0.5), y2 : birthScale(0.5) })
  legend.append("line").attrs({ transform : translate(10, 22), class : "birth-range", x1 : -6, x2 : 6, y1 : birthScale(-0.5), y2 : birthScale(-0.5) })

})
