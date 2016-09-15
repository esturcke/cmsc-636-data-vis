"use strict"

/* global d3, _ */

// extract lodash functions
const {
  flow,
} = _

// patient data source
const data = "./ehr.json"

// time conversion
const msInDays  = t => t / 1000 / 3600 / 24

// derived data
const injuryAge = patient => patient.injury.age

// canvas dimensions
const area   = [960, 500]
const margin = { top : 20, right : 20, bottom : 20, left : 20 }
const height = area[1] - margin.top  - margin.bottom
const width  = area[0] - margin.left - margin.right

// setup x- and y-axis scales and value selectors
const xScale = d3.scaleLinear().range([0, width]).nice()
const xValue = ([{ injury }, encounter]) => msInDays(encounter.date - injury.date)
const x      = flow(xValue, xScale)

const yScale = d3.scaleLinear().range([height, 0]).nice()
const y      = flow(injuryAge, yScale)

const translate = (x, y) => `translate(${x}, ${y})`

/**
 * Process data for a patient adding derived fields
 */
const enhance = patient => patient

// setup SVG area to draw on
const svg = d3.select("body").append("svg")
  .attr("width", area[0])
  .attr("height", area[1])
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

d3.json(data, (error, patients) => {
  if (error) throw error

  yScale.domain([d3.min(patients, injuryAge), d3.max(patients, injuryAge)])

  // join patients and create groups for each
  svg.selectAll(".patient")
    .data(patients.map(enhance))
    .enter()
    .append("g")
      .classed("patient", true)
      .attr("transform", patient => translate(width / 2, y(patient)))

})
