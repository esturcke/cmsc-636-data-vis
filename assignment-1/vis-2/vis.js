"use strict"

/* global d3 */

// patient data source
const data = "https://gist.githubusercontent.com/esturcke/2c0a1dcfa6bce8e37f697e8525c814c2/raw/17efba6b3c7d7831fd4cbfaa18a25b54b29299e1/ehr.json"

// time conversion
const msInYears = t => t / 1000 / 3600 / 24 / 365.25

// derived data
const injuryAge       = ({ patient }) => patient.injury.age
const encounterAge    = ({ encounter }) => encounter.age
const yearsFromInjury = ({ patient : { injury }, encounter }) => msInYears(encounter.date - injury.date)
const index           = ({ patient : { i } }) => i

// SVG area dimensions
const area   = [1460, 960]
const margin = { top : 40, right : 40, bottom : 100, left : 60 }
const height = area[1] - margin.top  - margin.bottom
const width  = area[0] - margin.left - margin.right

// setup x- and y-axis scales and value selectors
const x = d3.scaleLinear().range([0, width]).nice()
const y = d3.scaleLinear().range([height, 0]).nice()

// age bands
const ageBands = [
  [ 0,  9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
]

const translate = (x, y) => `translate(${x} ${y})`
const to        = (xVal, yVal) => datum => translate(x(xVal(datum)), y(yVal(datum)))

//
const symptoms = [
  "ptsd",
  "speech",
  "anxiety",
  "depression",
  "headache",
  "sleep",
  "audiology",
  "vision",
  "neurologic",
  "alzheimer",
  "cognitive",
  "pcs",
  "endocrine",
]
const encounter = ({ encounter }, i, nodes) => {
  const current = d3.select(nodes[i])
  current.append("line").attrs({ class : "encounter", x1 : 0, x2 : 0, y1 : -5, y2 : 5 })
  symptoms.forEach(
    (symtom, j) => encounter[symtom] ? current.append("circle").attrs({
      class     : "symptom",
      transform : `translate(4) rotate(${j * 360 / (symptoms.length)} -4 0)`,
    }) : null
  )
}

// setup SVG area to draw on
const svg = d3.select("body").append("svg")
  .attr("width", area[0])
  .attr("height", area[1])
  .append("g").attrs({
    transform : translate(margin.left, margin.top),
  })

d3.json(data, (error, data) => {
  if (error) throw error

  x.domain([
    d3.min(data, ({ patient }) => d3.min(patient.encounters, encounter => yearsFromInjury({ patient, encounter }))),
    d3.max(data, ({ patient }) => d3.max(patient.encounters, encounter => yearsFromInjury({ patient, encounter }))),
  ])
  y.domain([d3.min(data, index), d3.max(data, index)])

  // set up age bands
  const spacing = (y(0) - y(1)) / 2 + 1
  const bands = svg.append("g").attrs({ class : "bands" })
  ageBands.forEach(([min, max]) => {
    const patients = data.filter(patient => min <= injuryAge(patient) && injuryAge(patient) <= max)
    const y1 = y(index(patients[patients.length - 1])) - spacing
    const y2 = y(index(patients[0])) + spacing
    bands.append("rect").attrs({
      x      : -25,
      width  : width + 50,
      y      : y1,
      height : y2 - y1,
    })
  })

  // set up axes
  svg.append("g").attrs({ transform : translate(0, height + 10) }).call(d3.axisBottom(x))

  // add vertical line for time of injury
  svg.append("line").attrs({
    class : "injury-line",
    x1    : x(0),
    y1    : -10,
    x2    : x(0),
    y2    : height + 10,
  })

  // join patients and create groups for each
  const patients = svg.selectAll(".patient")
    .data(data)
    .enter()
    .append("g").attrs({
      class : "patient",
    })

  // join encounters and create a circle for each
  const encounters = patients.selectAll(".encounter")
    .data(({ patient }) => patient.encounters.map(encounter => ({ patient, encounter })))
    .enter()
    .append("g").attrs({
      transform : to(yearsFromInjury, index),
    })
    .each(encounter)
})
