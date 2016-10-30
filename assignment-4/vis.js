"use strict"

/* global d3, _ */

const {
  assign,
  debounce,
  first,
  flow,
  fromPairs,
  last,
  map,
  isUndefined,
  forEach,
  max,
  min,
  range,
} = _

// Load data
const data = new Promise((resolve, reject) => {
  const dataFile = "./data/ehr.json"
  d3.json(dataFile, (error, data) => error ? reject(error) : resolve(data))
})

const indexRange = flow([
  map(({ encounters }) => [first(encounters).i, last(encounters).i]),
  pairs => [min(pairs.map(([low, _high]) => low)), max(pairs.map(([_low, high]) => high))],
  ([low, high]) => range(low)(high + 2),
])

const symptoms = [
  "none",
  "stress",
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

const hiddenSymptoms = new Set()

const colors = ["rgb(243,243,243)", "rgb(30,123,32)", "rgb(236,159,231)", "rgb(98,206,117)", "rgb(213,71,202)", "rgb(65,201,220)", "rgb(254,29,102)", "rgb(15,118,122)", "rgb(159,168,225)", "rgb(120,91,174)", "rgb(160,180,96)", "rgb(182,69,59)", "rgb(254,165,59)", "rgb(118,103,98)", "rgb(210,160,136)"]

const lightness = d3.scaleLinear().domain([0, 10 * 365.25]).range([0.8, 1.1]).clamp(true)
const lighten = (color, days) => { color.l *= lightness(days); return color }
const timeLighten = days => color => lighten(color, Math.abs(days))
const symptomColor = d3.scaleOrdinal().domain(symptoms).range(colors)
const color = ({ symptom, daysSinceInjury }) => flow([
  symptomColor,
  d3.hsl,
  isUndefined(daysSinceInjury) ? c => c : timeLighten(daysSinceInjury),
])(symptom)

const arrayDefault = (array, empty) => array.length ? array : [empty]
const symptomsOrNone = encounter => arrayDefault(symptoms.filter(s => encounter[s]), "none")

const highlightSymptom = symptom => {
  d3.selectAll(".patient").attrs({ display : ({ symptoms }) => symptoms.includes(symptom) ? "inline" : "none" })
  d3.selectAll(".symptom-key .background").attrs({
    "fill-opacity" : s => s === symptom ? 1 : 0,
  })
  d3.selectAll(".symptom").attrs({
    "fill-opacity" : ({ symptom : s }) => s === symptom ? 1 : 0.2,
  })
}

const highlightNothing = () => {
  d3.selectAll(".patient").attrs({ display : "inline" })
  d3.selectAll(".symptom-key .background").attrs({
    "fill-opacity" : 0,
  })
  d3.selectAll(".symptom").attrs({
    "fill-opacity" : 1,
  })
}

const toggleSymptom = symptom => {
  if (hiddenSymptoms.has(symptom))
    hiddenSymptoms.delete(symptom)
  else
    hiddenSymptoms.add(symptom)
  d3.selectAll(".symptom-key").transition().attrs({ opacity: symptom => hiddenSymptoms.has(symptom) ? 0.2 : 1 })
}

const setupLabel = (node, swatchSize, lineHeight, padding) => {
  node
    .on("mouseover",  highlightSymptom)
    .on("mouseleave", highlightNothing)
    .on("click",      toggleSymptom)
    .attrs({ opacity : 1, cursor : "pointer" })
  node.append("rect").transition().attrs({
    class          : "background",
    x              : -padding,
    fill           : "#eee",
    "fill-opacity" : 0,
    width          : 100,
    height         : lineHeight,
  })
  node.append("rect").attrs({
    fill   : symptom  => color({ symptom }),
    y      : (lineHeight - swatchSize) / 2,
    width  : swatchSize,
    height : swatchSize,
  })
  node.append("g").attrs({
    transform : `translate(${swatchSize + 4} ${lineHeight - 2})`,
  }).append("text").text(s => s)
}

const setupLegend = svg => {
  const lineHeight = 12
  const width      = 100
  const padding    = 10
  const height     = lineHeight * symptoms.length + 2 * padding
  const swatchSize = 8

  const { margin : { left, bottom } } = svg.datum()

  const legend = svg
    .append("g").attrs({
      class : "legend",
    })
    .append("g").attrs({
      transform : `translate(${left} ${-(bottom + height)})`,
    })
  legend.append("rect").attrs({
    width,
    height,
    fill   : "none",
    stroke : "#ddd",
  })
  legend.selectAll(".symptom-key").data(symptoms).enter()
    .append("g").attrs({ class : "symptom-key", transform : (_, i) => `translate(${padding} ${i * lineHeight + padding})` })
    .call(setupLabel, swatchSize, lineHeight, padding)
}

const setupAxes = svg => {
  const { margin : { left } } = svg.datum()
  svg.append("g").attrs({
    class : "encounter-axis",
  })
  .append("g").attrs({
    transform : `translate(${left} -4)`,
  })
  .append("text").text("encounter since TBI").attrs({
    "text-anchor" : "start",
  })
}

const setup = data => {
  const margin    = 10
  const axisWidth = 30
  d3.select("body").append("svg")
      .data([{
        scale : {
          x              : d3.scaleBand().domain(indexRange(data)),
          y              : d3.scaleBand().domain(data.sort((a, b) => b.injury.age - a.injury.age).map(({ id }) => id)),
          symptomOffsets : fromPairs(data.map(({ id, symptoms }) => [id, d3.scaleBand().domain(symptoms)])),
        },
        margin : { top : margin, right : margin, bottom : margin + 2 * axisWidth, left : margin + axisWidth },
      }])
    .selectAll(".patient")
      .data(data, ({ id }) => id)
      .enter().append("g").attrs({ class : "patient" })
    .selectAll(".encounter")
      .data(({ id : patientId, encounters }) => encounters.map(e => assign(e, { patientId })), ({ id }) => id)
      .enter().append("g").attrs({ class : "encounter" })
    .selectAll(".symptom")
      .data(encounter => symptomsOrNone(encounter).map(symptom => ({ symptom, patientId : encounter.patientId, daysSinceInjury : encounter.daysSinceInjury })))
      .enter().append("rect").attrs({
        class          : "symptom",
        fill           : color,
        stroke         : "white",
        opacity        : 1,
        "stroke-width" : 0.5,
        "data-symptom" : ({ symptom }) => symptom,
      })

  // Add label and axis
  const svg = d3.select("svg")
  svg.append("path").attrs({
    class  : "tbi",
    stroke : "#aaa",
  })

  // set up x-axis
  svg.call(setupAxes)
  svg.call(setupLegend)
}

const dimensions = () => {
  const { innerWidth : width, innerHeight : height } = window
  return { width, height }
}

const setRanges = ({ width, height, margin : { left, right, top, bottom } }) => d => {
  d.scale.x.range([left, width - right])
  d.scale.y.range([top, height - bottom])
  forEach(scale => scale.range([0, d.scale.y.bandwidth()]))(d.scale.symptomOffsets)
  return d
}

const draw = () => {
  const svg = d3.select("svg")

  const { width, height } = dimensions()
  const { margin, scale : { x, y, symptomOffsets } } = svg.datum()

  svg.datum(flow([
    setRanges({ width, height, margin }),
  ]))
  svg.attrs({ width, height })

  d3.selectAll(".patient").attrs({
    transform : ({ id }) => `translate(0 ${y(id)})`,
  })

  d3.selectAll(".encounter").attrs({
    transform : ({ i }) => `translate(${x(i < 0 ? i : i + 1)} 0)`,
  })

  d3.selectAll(".symptom").attrs({
    y      : ({ symptom, patientId }) => symptomOffsets[patientId](symptom),
    width  : x.bandwidth(),
    height : ({ symptom, patientId }) => symptom === "none" ? y.bandwidth() : symptomOffsets[patientId].bandwidth(),
  })

  d3.select(".tbi").attrs({
    d : `M${x(0) + x.bandwidth() / 2}, ${margin.top} V${height - margin.bottom}`,
    "stroke-width" : x.bandwidth(),
  })

  d3.select(".legend").attrs({
    transform : () => `translate(0 ${height})`,
  })

  d3.select(".encounter-axis").attrs({
    transform : `translate(0 ${height - 40})`,
  }).call(d3.axisBottom(x).tickValues([-200, -100, 0, 100, 200, 300]))
}
