# Assignment 1: Visualization Construction

[Assigment statement](https://sites.google.com/a/umbc.edu/datavisualization/assignments/asgn1) 

## Part 1: Tool Overview

### [Tableau Public](https://public.tableau.com/s/)

...

### [D3.js](https://d3js.org/)

...

## Part 2: Visualizations

I chose to work with the traumatic brain injury electronic health record data.
As multi-dimensional data it is most similar to data found in InfoSec—what I
plan on working on for the final project.

The first step was to covert the data from rows of encounters to something
that’s organized by patients. I wrote a [small script](data/to-json) to create
a JSON object keyed by patient ID with information about the injury as well as
an array of encounters. Along with this, I normalized the date and flags. I also
did a number of sanity checks that the patient and injury information didn’t
change between encounters. The gender field had some defaulted values that had
to be cleaned up as well. Otherwise the data was consistent.

### [Vis 1](https://bl.ocks.org/esturcke/510d67c32b5949e55aaee750a6534113)

... [ steps to produce your images ]

### Vis 2

... [ steps to produce your images ]

### Vis 3

... [ steps to produce your images ]

### Vis 4

... [ steps to produce your images ]
