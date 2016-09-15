"use strict"

/* global d3  */

// patient data source
const data = "./ehr.json"

// time conversion
const msInDays = t => t / 1000 / 3600 / 24

// derived data
const injuryAge      = ({ patient }) => patient.injury.age
const encounterAge   = ({ encounter }) => encounter.age
const daysFromInjury = ({ patient : { injury }, encounter }) => msInDays(encounter.date - injury.date)

// SVG area dimensions
const area   = [960, 500]
const margin = { top : 20, right : 20, bottom : 20, left : 20 }
const height = area[1] - margin.top  - margin.bottom
const width  = area[0] - margin.left - margin.right

// setup x- and y-axis scales and value selectors
const x = d3.scaleLinear().range([0, width]).nice()
const y = d3.scaleLinear().range([height, 0]).nice()

const translate = (x, y) => `translate(${x}, ${y})`
const to        = (xVal, yVal) => datum => translate(x(xVal(datum)), y(yVal(datum)))

// setup SVG area to draw on
const svg = d3.select("body").append("svg")
  .attr("width", area[0])
  .attr("height", area[1])
  .append("g")
    .attr("transform", translate(margin.left, margin.top))

d3.json(data, (error, data) => {
  if (error) throw error

  x.domain([-300, 300])
  y.domain([d3.min(data, injuryAge), d3.max(data, injuryAge)])

  // join patients and create groups for each
  const patients = svg.selectAll(".patient")
    .data(data)
    .enter()
    .append("g")
      .classed("patient", true)

  // join encounters and create a circle for each
  const encounters = patients.selectAll(".encounter")
    .data(({ patient }) => patient.encounters.map(encounter => ({ patient, encounter })))
    .enter()
    .append("circle")
      .classed("encounter", true)
      .attr("r", 2)
      .attr("opacity", 0.5)
      .attr("transform", to(daysFromInjury, injuryAge))
})
