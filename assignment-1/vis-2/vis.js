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
const area   = [960, 960]
const margin = { top : 40, right : 40, bottom : 100, left : 60 }
const height = area[1] - margin.top  - margin.bottom
const width  = area[0] - margin.left - margin.right

// setup x- and y-axis scales and value selectors
const x = d3.scaleLinear().range([0, width]).nice()
const y = d3.scaleLinear().range([height, 0]).nice()

const translate = (x, y) => `translate(${x} ${y})`
const to        = (xVal, yVal) => datum => translate(x(xVal(datum)), y(yVal(datum)))

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

  // set up axes
  svg.append("g").attrs({ transform : translate(0, height + 10) }).call(d3.axisBottom(x))
  svg.append("g").attrs({ transform : translate(-5, 0) }).call(d3.axisLeft(y))

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
    .append("circle").attrs({
      class     : "encounter",
      r         : 2,
      opacity   : 0.5,
      transform : to(yearsFromInjury, index),
    })
})
