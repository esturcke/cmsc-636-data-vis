"use strict"

/* global d3, _ */

let width  = document.body.clientWidth
let height = d3.max([document.body.clientHeight - 540, 240])

const m = [60, 0, 10, 0]
const yscale = {}
const dragging = {}

let data
let w = width - m[1] - m[3]
let h = height - m[0] - m[2]
let brush_count = 0
let render_speed = 50
let excluded_groups = []
let xscale = d3.scale.ordinal().rangePoints([0, w], 1)
let axis = d3.svg.axis().orient("left").ticks(1 + height / 50)
let foreground
let background
let highlighted
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

const colors2 = {
  "AIP"       : "#1f78b4",
  "AIV"       : "#33a02c",
  "IPV"       : "#e31a1c",
  "APV"       : "#ff7f00",
  "AIPV"      : "#6a3d9a",
  "Untreated" : "#b15928",
}

// Scale chart and canvas height
d3.select("#chart")
  .style("height", (h + m[0] + m[2]) + "px")

d3.selectAll("canvas")
  .attr("width", w)
  .attr("height", h)
  .style("padding", m.join("px ") + "px")

// Foreground canvas for primary view
foreground = document.getElementById("foreground").getContext("2d")
foreground.globalCompositeOperation = "destination-over"
foreground.strokeStyle = "rgba(0,100,160,0.1)"
foreground.lineWidth = 1.7
foreground.fillText("Loading...",w / 2,h / 2)

// Highlight canvas for temporary interactions
highlighted = document.getElementById("highlight").getContext("2d")
highlighted.strokeStyle = "rgba(0,100,160,1)"
highlighted.lineWidth = 4

// Background canvas
background = document.getElementById("background").getContext("2d")
background.strokeStyle = "rgba(0,100,160,0.1)"
background.lineWidth = 1.7

// SVG for ticks, labels, and interactions
const svg = d3.select("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

// Load the data and visualization
d3.csv("tumor.csv", function(raw_data) {
  // Convert quantitative scales to floats
  data = raw_data.map(function(d) {
    for (const k in d) {
      if (!_.isNaN(raw_data[0][k] - 0) && k != "id") {
        d[k] = parseFloat(d[k]) || 0
      }
    }
    return d
  })

  const dims =  [
    "Tumor mass (mg)",
    "Organ",
    "Therapy",
    //"Mouse number",
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

  const min = 0.001147767
  const max = 70
  xscale.domain(dimensions = dims.filter(function(k) {
    return (_.isNumber(data[0][k]))    && (yscale[k] =  (k === "Tumor mass (mg)") ?  d3.scale.log().domain([7, 1703]).range([h, 0])  :  // (yscale[k] = d3.scale.linear()
              d3.scale.log()
              .domain([min, max])
              .range([h, 0]))
      //.domain(d3.extent(data, function(d) { return +d[k] }))
     // .range([h, 0]))
  }))

  // Add a status element for each dimension.
  const g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")" })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xscale(d)
          this.__dragged__ = false
          d3.select("#foreground").style("opacity", "0.35")
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx))
          dimensions.sort(function(a, b) { return position(a) - position(b) })
          xscale.domain(dimensions)
          g.attr("transform", function(d) { return "translate(" + position(d) + ")" })
          brush_count++
          this.__dragged__ = true

          // Feedback for axis deletion if dropped
          if (dragging[d] < 12 || dragging[d] > w - 12) {
            d3.select(this).select(".background").style("fill", "#b00")
          } else {
            d3.select(this).select(".background").style("fill", null)
          }
        })
        .on("dragend", function(d) {
          let extent
          if (!this.__dragged__) {
            // no movement, invert axis
            //const extent = invert_axis(d)

          } else {
            // reorder axes
            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")")

            extent = yscale[d].brush.extent()
          }

          // remove axis if dragged all the way left
          if (dragging[d] < 12 || dragging[d] > w - 12) {
            remove_axis(d,g)
          }

          // TODO required to avoid a bug
          xscale.domain(dimensions)
          update_ticks(d, extent)

          // rerender
          d3.select("#foreground").style("opacity", null)
          brush()
          delete this.__dragged__
          delete this.__origin__
          delete dragging[d]
        }))

  const formatter = d3.format(",.0f")
  const logFormatter = d3.format(".3f")
  // Add an axis and title.
  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d]).tickFormat(function(d) { return d >= 1 ? formatter(d) : logFormatter(d)} ).tickValues([0.001, 0.01, 0.1, 0.5, 1.0, 10, 20, 40, 60])) })   //
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", function(d,i) { return i % 2 == 0 ? -14 : -30 } )
      .attr("x", 0)
      .attr("class", "label")
      .text(String)
      .append("title")
        .text("Click to invert. Drag to reorder")

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)) })
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

// render polylines i to i+render_speed
function render_range(selection, i, max, opacity) {
  selection.slice(i,max).forEach(function(d) {
    const col = (d.Organ === "Tumor") ? color2(d.Therapy,opacity) : color(d.Therapy,opacity)
    path(d, foreground,col)
  })
}

// sample data table
function data_table(unsortedSample) {
  // sort by first column
  const sample = unsortedSample.sort(function(a,b) {
    const col = d3.keys(a)[0]
    return a[col] < b[col] ? -1 : 1
  })

  const table = d3.select("#clinic-list")
    .html("")
    .selectAll(".row")
      .data(sample)
    .enter().append("div")
      .on("mouseover", highlight)
      .on("mouseout", unhighlight)

  table
    .append("span")
      .attr("class", "color-block")
      .style("background", function(d) {
        const col = (d.Organ === "Tumor") ? color2(d.Therapy,0.85) : color(d.Therapy,0.85)
        return col })

  table
    .append("span")
      .text(function(d) {
        return d.Organ + ", Therapy: " + d.Therapy + ", Tumor mass (mg): " + d["Tumor mass (mg)"]  })
}

// Adjusts rendering speed
function optimize(timer) {
  const delta = (new Date()).getTime() - timer
  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8)
  render_speed = Math.min(render_speed, 300)
  return (new Date()).getTime()
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
  d3.select("#rendered-count").text(i)
  d3.select("#rendered-bar")
    .style("width", (100 * i / n) + "%")
  d3.select("#render-speed").text(render_speed)
}

// Feedback on selection
function selection_stats(opacity, n, total) {
  d3.select("#data-count").text(total)
  d3.select("#selected-count").text(n)
  d3.select("#selected-bar").style("width", (100 * n / total) + "%")
  d3.select("#opacity").text(("" + (opacity * 100)).slice(0,4) + "%")
}

// Highlight single polyline
function highlight(d) {
  d3.select("#foreground").style("opacity", "0.25")
  d3.selectAll(".row").style("opacity", function(p) { return (d.Therapy == p) ? null : "0.3" })
  const col = (d.Organ === "Tumor") ? color2(d.Therapy,1) : color(d.Therapy,1)
  path(d, highlighted, col)
}

// Remove highlight
function unhighlight() {
  d3.select("#foreground").style("opacity", null)
  d3.selectAll(".row").style("opacity", null)
  highlighted.clearRect(0,0,w,h)
}

function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color
  ctx.beginPath()
  let x0 = xscale(0) - 3,
    y0 = yscale[dimensions[0]](d[dimensions[0]])   // left edge
  ctx.moveTo(x0,y0)
  dimensions.map(function(p) {
    const x = xscale(p),
      y = yscale[p](d[p])
    const cp1x = x - 0.88 * (x - x0)
    const cp1y = y0
    const cp2x = x - 0.12 * (x - x0)
    const cp2y = y
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
    x0 = x
    y0 = y
  })
  ctx.lineTo(x0 + 3, y0)                               // right edge
  ctx.stroke()
}

function color(d) {
  const c = colors[d]
  //return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("")
  return c
}

function color2(d) {
  const c = colors2[d]
  //return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("")
  return c
}

function position(d) {
  const v = dragging[d]
  return v == null ? xscale(d) : v
}

// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
  brush_count++
  const actives = dimensions.filter(function(p) { return !yscale[p].brush.empty() }),
    extents = actives.map(function(p) { return yscale[p].brush.extent() })

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
        return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
      }) ? selected.push(d) : null
    })

  // free text search
  const query = d3.select("#search")[0][0].value
  if (query.length > 0) {
    selected = search(selected, query)
  }

  if (selected.length < data.length && selected.length > 0) {
    d3.select("#keep-data").attr("disabled", null)
    d3.select("#exclude-data").attr("disabled", null)
  } else {
    d3.select("#keep-data").attr("disabled", "disabled")
    d3.select("#exclude-data").attr("disabled", "disabled")
  }

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
    .style("width", function(d) {
      return Math.ceil(600 * tallies[d].length / data.length) + "px"
    })

  legend.selectAll(".tally")
    .text(function(d) {
      return tallies[d].length })

  // Render selected lines
  paths(selected, foreground, brush_count, true)
}

// render a set of polylines on a canvas
function paths(selected, ctx, count) {
  const n = selected.length,
    opacity = d3.min([2 / Math.pow(n,0.3),1])
  let i = 0,
    timer = (new Date()).getTime()
  selection_stats(opacity, n, data.length)

  const shuffled_data = _.shuffle(selected)

  data_table(shuffled_data.slice(0,108))

  ctx.clearRect(0,0,w + 1,h + 1)

  // render all lines until finished or a new brush event
  function animloop() {
    if (i >= n || count < brush_count) return true
    const max = d3.min([i + render_speed, n])
    render_range(shuffled_data, i, max, opacity)
    render_stats(max,n,render_speed)
    i = max
    timer = optimize(timer)  // adjusts render_speed
  }

  d3.timer(animloop)
}

// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
  // update brushes
  if (d) {
    const brush_el = d3.selectAll(".brush")
        .filter(function(key) { return key == d })
    // single tick
    if (extent) {
      // restore previous extent
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush))
    } else {
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush))
    }
  } else {
    // all ticks
    d3.selectAll(".brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)) })
  }

  brush_count++

  show_ticks()

  // update axes
  d3.selectAll(".axis")
    .each(function(d) {
      // hide lines for better performance
      d3.select(this).selectAll("line").style("display", "none")

      // transition axis numbers
      d3.select(this)
        .transition()
        .duration(720)
        .call(axis.scale(yscale[d]))

      // bring lines back
      d3.select(this).selectAll("line").transition().delay(800).style("display", null)

      d3.select(this)
        .selectAll("text")
        .style("font-weight", null)
        .style("font-size", null)
        .style("display", null)
    })
}

// Rescale to new dataset domain
function rescale() {
  // reset yscales, preserving inverted state
  dimensions.forEach(function(d) {
    if (yscale[d].inverted) {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d] }))
          .range([0, h])
      yscale[d].inverted = true
    } else {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d] }))
          .range([h, 0])
    }
  })

  update_ticks()

  // Render selected data
  paths(data, foreground, brush_count)
}

// Get polylines within extents
function actives() {
  const actives = dimensions.filter(function(p) { return !yscale[p].brush.empty() }),
    extents = actives.map(function(p) { return yscale[p].brush.extent() })

  // filter extents and excluded groups
  let selected = []
  data.filter(function(d) {
    return !excluded_groups.includes(d.Hospital)
  }).map(function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1]
    }) ? selected.push(d) : null
  })

  // free text search
  const query = d3.select("#search")[0][0].value
  if (query > 0) {
    selected = search(selected, query)
  }

  return selected
}

// Export data
function export_csv() {
  const keys = d3.keys(data[0])
  const rows = actives().map(function(row) {
    return keys.map(function(k) { return row[k] })
  })
  const csv = d3.csv.format([keys].concat(rows)).replace(/\n/g,"<br/>\n")
  const styles = "<style>body { font-family: sans-serif font-size: 12px }</style>"
  window.open("text/csv").document.write(styles + csv)
}

// scale to window size
window.onresize = function() {
  width = document.body.clientWidth,
  height = d3.max([document.body.clientHeight - 500, 220])

  w = width - m[1] - m[3],
  h = height - m[0] - m[2]

  d3.select("#chart")
      .style("height", (h + m[0] + m[2]) + "px")

  d3.selectAll("canvas")
      .attr("width", w)
      .attr("height", h)
      .style("padding", m.join("px ") + "px")

  d3.select("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .select("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

  xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions)
  dimensions.forEach(function(d) {
    yscale[d].range([h, 0])
  })

  d3.selectAll(".dimension")
    .attr("transform", function(d) { return "translate(" + xscale(d) + ")" })
  // update brush placement
  d3.selectAll(".brush")
    .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)) })
  brush_count++

  // update axis placement
  axis = axis.ticks(1 + height / 50),
  d3.selectAll(".axis")
    .each(function(d) { d3.select(this).call(axis.scale(yscale[d])) })

  // render data
  brush()
}

// Remove all but selected from the dataset
function keep_data() {
  const new_data = actives()
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.")
    return false
  }
  data = new_data
  rescale()
}

// Exclude selected from the dataset
function exclude_data() {
  const new_data = _.difference(data, actives())
  if (new_data.length == 0) {
    alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'.")
    return false
  }
  data = new_data
  rescale()
}

function remove_axis(d,g) {
  dimensions = _.difference(dimensions, [d])
  xscale.domain(dimensions)
  g.attr("transform", function(p) { return "translate(" + position(p) + ")" })
  g.filter(function(p) { return p == d }).remove()
  update_ticks()
}

d3.select("#keep-data").on("click", keep_data)
d3.select("#exclude-data").on("click", exclude_data)
d3.select("#export-data").on("click", export_csv)
d3.select("#search").on("keyup", brush)


// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks)
d3.select("#show-ticks").on("click", show_ticks)
d3.select("#dark-theme").on("click", dark_theme)
d3.select("#light-theme").on("click", light_theme)

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

function dark_theme() {
  d3.select("body").attr("class", "dark")
  d3.selectAll("#dark-theme").attr("disabled", "disabled")
  d3.selectAll("#light-theme").attr("disabled", null)
}

function light_theme() {
  d3.select("body").attr("class", null)
  d3.selectAll("#light-theme").attr("disabled", "disabled")
  d3.selectAll("#dark-theme").attr("disabled", null)
}

function search(selection,str) {
  const pattern = new RegExp(str,"i")
  return _(selection).filter(function(d) { return pattern.exec(d.id) })
}
