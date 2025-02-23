"use strict"

/* global d3, _ */

let width  = document.body.clientWidth
let height = d3.max([document.body.clientHeight - 540, 240])

const m = [60, 0, 10, 0]

let data
let w = width - m[1] - m[3]
let h = height - m[0] - m[2]
let excluded_groups = []
let xscale = d3.scale.ordinal().rangePoints([0, w], 1)
let axis = d3.svg.axis().orient("left").ticks(1 + height / 50)
let dimensions
let legend

const colors = {
  "AIP"             : "#a6cee3",
  "AIV"             : "#b2df8a",
  "IPV"             : "#fb9a99",
  "APV"             : "#fdbf6f",
  "AIPV"            : "#cab2d6",
  "Untreated"       : "#ffff99",
  "AIP Tumor"       : "#1f78b4",
  "AIV Tumor"       : "#33a02c",
  "IPV Tumor"       : "#e31a1c",
  "APV Tumor"       : "#ff7f00",
  "AIPV Tumor"      : "#6a3d9a",
  "Untreated Tumor" : "#b15928",
}

// Scale chart and canvas height
d3.select("#chart")
  .style("height", (h + m[0] + m[2]) + "px")

// SVG for ticks, labels, and interactions
const svg = d3.select("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

const ratioAttributes = [
  "Tumor mass (mg)",
  "Eotaxin",
  "G-CSF",
  "GM-CSF",
  "IFNg",
  "IL-1a",
  "IL-1b",
  "IL-2",
  "IL-3",
  "IL-4",
  "IL-5",
  "IL-6",
  "IL-7",
  "IL-9",
  "IL-10",
  "IL-12p40",
  "IL-12p70",
  "IL-13",
  "IL-15",
  "IL-17",
  "IP-10",
  "KC",
  "LIF",
  "LIX",
  "M-CSF",
  "MCP-1",
  "MIG",
  "MIP-1a",
  "MIP-1b",
  "MIP-2",
  "RANTES",
  "TNFa",
  "VEGF",
]

//
const processAttribute = (value, attribute) => ["Organ", "Therapy"].includes(attribute) ? value : parseFloat(value)
const itemType = ({ Therapy, Organ }) => Organ === "Tumor" ? `${Therapy} ${Organ}` : Therapy
const processItem = _.flow(
  item => _.mapValues(item, processAttribute),
  item => Object.assign(item, { type : itemType(item) })
)

// Collect therapy/organ summaries
const attributeStats = items => _.flow(
  attributes => attributes.map(attribute => [attribute, items.map(item => item[attribute]).sort()]),
  _.fromPairs
)(ratioAttributes)
const typeStats = _.flow(
  data   => _.groupBy(data, "type"),
  groups => _.mapValues(groups, attributeStats)
)

const sampleCoordinates = datum => "M" + dimensions.map(({ label, scale }) => `${xscale(label)} ${scale(datum[label])}` ).join(" L ")
const scaleSamples = () => svg.selectAll(".sample").attr("d", sampleCoordinates)

// Load the data and visualization
d3.csv("tumor.csv", function(raw_data) {
  // Convert quantitative scales to floats
  data = raw_data.map(processItem)

  dimensions = ratioAttributes.map(label => ({
    label,
    scale : d3.scale.log().domain(label === "Tumor mass (mg)" ? [7, 1703] : [0.001, 70]).range([h, 0]),
  }))

  xscale.domain(dimensions.map(({ label }) => label))

  const sampleColor = ({ type }) => { const c = color(type); c.s *= 0.7; c.l *= 1.1; return c + "" }
  svg.selectAll(".sample")
    .data(data)
    .enter().append("path").attr({
      class          : "sample",
      d              : sampleCoordinates,
      stroke         : sampleColor,
      "stroke-width" : 0.5,
      opacity        : 0.8,
      fill           : "none",
    })

  const g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", ({ label }) => `translate(${xscale(label)})`)

  const formatter = d3.format(",.0f")
  const logFormatter = d3.format(".3f")
  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(d.scale).tickFormat(function(d) { return d >= 1 ? formatter(d) : logFormatter(d)} ).tickValues([0.001, 0.01, 0.1, 0.5, 1.0, 10, 20, 40, 60])) })   //
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", function(d,i) { return i % 2 == 0 ? -14 : -30 } )
      .attr("x", 0)
      .attr("class", "label")
      .text(({ label }) => label)
      .append("title")
        .text("Click to invert. Drag to reorder")

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(d.scale.brush = d3.svg.brush().y(d.scale).on("brush", brush)) })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -23)
      .attr("width", 36)
      .append("title")
        .text("Drag up or down to brush along this axis")

  g.selectAll(".extent")
      .append("title")
        .text("Drag or resize this filter")


  legend = create_legend(colors,brush)

  // Render full foreground
  brush()

})

function create_legend(colors,brush) {

  // create legend
  const legend_data = d3.select("#legend")
    .html("")
    .selectAll(".row")
    .data( _.keys(colors).sort() )

  // filter by Therapy
  const legend = legend_data
    .enter().append("div")
      .attr("title", "Hide group")
      .on("click", function(d) {
        // toggle group
        if (excluded_groups.includes(d)) {
          d3.select(this).attr("title", "Hide group")
          excluded_groups = _.filter(excluded_groups, g => g !== d)
          brush()
        } else {
          d3.select(this).attr("title", "Show group")
          excluded_groups.push(d)
          brush()
        }
      })

  legend
    .append("span")
    .style("background", function(d) {return color(d,0.85) })
    .attr("class", "color-bar")

  legend
    .append("span")
    .attr("class", "tally")
    .text(function() { return 0 })

  legend
    .append("span")
    .text(function(d) { return " " + d + (d.indexOf("Tumor") < 0 ? " Lymph" : "") })

  return legend
}

function color(d) {
  return d3.hsl(colors[d])
}

// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
  const actives = dimensions.filter(p => !p.scale.brush.empty()),
    extents = actives.map(p => p.scale.brush.extent())

  // hack to hide ticks beyond extent
  d3.selectAll(".dimension")[0]
    .forEach(function(element) {
      const dimension = d3.select(element).data()[0]
      if (actives.includes(dimension)) {
        const extent = extents[actives.indexOf(dimension)]
        d3.select(element)
          .selectAll("text")
          .style("font-weight", "bold")
          .style("font-size", "13px")
          .style("display", function() {
            const value = d3.select(this).data()
            return extent[0] <= value && value <= extent[1] ? null : "none"
          })
      } else {
        d3.select(element)
          .selectAll("text")
          .style("font-size", null)
          .style("font-weight", null)
          .style("display", null)
      }
      d3.select(element)
        .selectAll(".label")
        .style("display", null)
    })


  // bold dimensions with label
  d3.selectAll(".label")
    .style("font-weight", function(dimension) {
      if (actives.includes(dimension)) return "bold"
      return null
    })

  // Get lines within extents
  let selected = []
  data
    .filter(function(d) {
      let result = true
      excluded_groups.forEach(function(group) {
        let org = ""
        let id = group.indexOf("Tumor")
        if ( id >= 0) {
          org = "Tumor"
          id--
          if (group.substring(0, id) === d.Therapy && org === d.Organ  )
            result = false
        }
        else {
          org = "Lymph Node"
          if (group === d.Therapy && org === d.Organ)
            result = false
        }
      })
      return result
    })
    .map(function(d) {
      return actives.every(function(p, dimension) {
        return extents[dimension][0] <= d[p.label] && d[p.label] <= extents[dimension][1]
      }) ? selected.push(d) : null
    })

  svg.selectAll(".sample").attr({
    visibility : d => selected.includes(d) ? "visible" : "hidden",
  })

  const tallies = {} // _(selected).groupBy(function(d) {return d.Therapy})
  tallies["AIP"] = []
  tallies["AIV"] = []
  tallies["AIPV"] = []
  tallies["APV"] = []
  tallies["IPV"] = []
  tallies["Untreated"] = []
  tallies["AIP Tumor"] = []
  tallies["AIV Tumor"] = []
  tallies["AIPV Tumor"] = []
  tallies["APV Tumor"] = []
  tallies["IPV Tumor"] = []
  tallies["Untreated Tumor"] = []

  _(selected).forEach(function(obj) {
    const cat = "" + obj.Therapy + (obj.Organ === "Tumor" ? " Tumor" : "")
    tallies[cat].push(obj)
  })

  // include empty groups
  _(colors).each(function(v,k) { tallies[k] = tallies[k] || [] })


  legend
    .style("text-decoration", function(d) { return excluded_groups.includes(d) ? "line-through" : null })
    .attr("class", function(d) {
      return (tallies[d].length > 0)
           ? "row"
           : "row off"
    })

  legend.selectAll(".color-bar")
    .style("width", d => Math.ceil(600 * tallies[d].length / data.length) + "px")

  legend.selectAll(".tally")
    .text(function(d) {
      return tallies[d].length })

  //updateBoxPlots(selected)

  const boxPlotValues = values => [
    d3.quantile(values, .05),
    d3.quantile(values, .25),
    d3.quantile(values, .50),
    d3.quantile(values, .75),
    d3.quantile(values, .95),
  ]

  // Collect selected therapy/organ summaries
  const stats = typeStats(selected)
  const typeCount = Object.keys(stats).length

  // box plot width
  const w  = 3
  const w2 = 6
  const w3 = 8

  const boxPlots = d3.selectAll(".axis").selectAll(".box-plot")
    .data(
      ({ label, scale }) => _.map(stats, (attributes, type) => ({ type, label, y : boxPlotValues(attributes[label]).map(scale) })),
      ({ label, type  }) => `${label}-${type}`
    )
  boxPlots.exit().remove()
  boxPlots.enter().append("g").attr({
    class  : "box-plot",
    stroke : ({ type }) => colors[type],
    fill   : "none",
    "stroke-width" : 0.5,
  })

  const xOffset = i => (w + 1) * (typeCount / 2 - i)
  boxPlots.attr({
    transform : (_datum, i) => `translate(${xOffset(i)} 0)`,
  })

  // Redraw box plots
  boxPlots.selectAll("path, rect").remove()

  // Add box
  boxPlots.append("rect").attr({
    x      : -w / 2,
    width  : w,
    y      : ({ y }) => y[3],
    height : ({ y }) => y[1] - y[3],
    fill   : ({ type }) => color(type),
    stroke : "white",
  })

  // Add median line
  boxPlots.append("path").attr({
    d : ({ y }) => `M -${w3 / 2} ${y[2]} h ${w3}`,
  })
  boxPlots.append("path").attr({
    d : ({ y }) => `M -${w / 2} ${y[2]} h ${w}`,
    stroke : "white",
  })

  // Whiskers
  boxPlots.append("path").attr({
    d : ({ y }) => `
      M -${w2 / 2} ${y[0]} h ${w2}
      M -${w2 / 2} ${y[4]} h ${w2}
    `,
  })

  boxPlots.append("path").attr({
    opacity : 0.7,
  }).attr("d", ({ y }) => `
    M 0 ${y[0]} V ${y[1]}
    M 0 ${y[3]} V ${y[4]}
  `)
}

// scale to window size
window.onresize = function() {
  width = document.body.clientWidth,
  height = d3.max([document.body.clientHeight - 500, 220])

  w = width - m[1] - m[3],
  h = height - m[0] - m[2]

  d3.select("#chart")
      .style("height", (h + m[0] + m[2]) + "px")

  d3.select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

  xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions.map(({ label }) => label))
  dimensions.forEach(function(d) {
    d.scale.range([h, 0])
  })

  scaleSamples()

  d3.selectAll(".dimension")
    .attr("transform", function(d) { return "translate(" + xscale(d.label) + ")" })
  // update brush placement
  d3.selectAll(".brush")
    .each(function(d) { d3.select(this).call(d.scale.brush = d3.svg.brush().y(d.scale).on("brush", brush)) })

  // update axis placement
  axis = axis.ticks(1 + height / 50),
  d3.selectAll(".axis")
    .each(function(d) { d3.select(this).call(axis.scale(d.scale)) })

  // render data
  brush()
}

d3.select("#search").on("keyup", brush)

// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks)
d3.select("#show-ticks").on("click", show_ticks)

function hide_ticks() {
  d3.selectAll(".axis g").style("display", "none")
  //d3.selectAll(".axis path").style("display", "none")
  d3.selectAll(".background").style("visibility", "hidden")
  d3.selectAll("#hide-ticks").attr("disabled", "disabled")
  d3.selectAll("#show-ticks").attr("disabled", null)
}

function show_ticks() {
  d3.selectAll(".axis g").style("display", null)
  //d3.selectAll(".axis path").style("display", null)
  d3.selectAll(".background").style("visibility", null)
  d3.selectAll("#show-ticks").attr("disabled", "disabled")
  d3.selectAll("#hide-ticks").attr("disabled", null)
}
