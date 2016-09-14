"use strict"

/* global d3 */

const DATA = "./ehr.json"
const AREA = [ 960, 500 ]
const MARGIN = { top : 20, right : 20, bottom : 20, left : 20 }

/**
 * Process data for a patient adding derived fields
 */
const enhance = patient => patient

// setup SVG area to draw on
const svg = d3.select("body").append("svg")
  .attr("width", AREA[0])
  .attr("height", AREA[1])
  .append("g")
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")

d3.json(DATA, (error, patients) => {
  if (error) throw error

  // join patients and create groups for each
  svg.selectAll(".patient")
    .data(patients.map(enhance))
    .enter().append("g").classed("patient", true)
})
