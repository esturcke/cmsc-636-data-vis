# Assignment 1: Visualization Construction

[Assigment statement](https://sites.google.com/a/umbc.edu/datavisualization/assignments/asgn1) 

## Part 1: Tool Overview

### [Tableau Public](https://public.tableau.com/s/)

Tableau is very quick to get started with. I was able to import the CSV EHR
data and it automatically identifies what data can be used as a dimension and
what is a measurement. It also identified data types for each piece of data
(although I couldn’t get it to treat the symptoms as booleans).  Creating
graphs is also quick by simply dragging data onto a central work area.
Creating derived data is also pretty straightforward by creating functions that
involve other fields. 

The difficulties started to crop up when I tried making sense of the EHR data
and graphs. The data is a bit tricky because it’s hierarchical, but flattened
to a two dimensional spread sheet with redundant data. There looks to be a way
to describe heirarchy in Tableau, but I was not able to figure it out. So in the
end, it was easy to create pretty graphs, but I'm not sure if what I was graphing
actually made sense or if the duplication and hierarchy present in the data was
throwing off everything.

### [D3.js](https://d3js.org/)

D3 was a very different experience. It was much harder to get started. It supplies
you with the basic primitives to manipulate data, bind it to DOM elements and use
that bound data to create and manipulate DOM elements. It is very capable, but
even simple things like creating a legend, or creating non-standard axes was
challenging. But because it’s all Javascript programming, I never felt stuck and I
always had a clear understating of what was going on with the data. It was
just sometimes frustrating how seemingly simple things could not be
expressed simply in D3.

I also found that data joining or binding to be a bit tricky. It one of the core
principles of D3 and creating declarative visualizations, but it’s been a bit hard
to wrap my mind around.

But in terms of flexibility and customization D3 really shines. Everything that
can be represented in Javascript can be done with D3. There are no canned visualizations,
but rather functions that help manipulate data and manipulate the DOM based on that
data. There are also tons of tutorials and examples online.

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
to be cleaned up as well. Otherwise the data looked consistent. That is until
I started looking at the ages at each encounter and time of injury.

### [Vis 1](https://bl.ocks.org/esturcke/510d67c32b5949e55aaee750a6534113)

The first visualization grapples with the age inconsistencies.

... [ steps to produce your images ]

### [Vis 2](https://bl.ocks.org/esturcke/65673642c2221dd7f0ef428e13ab782b)

![Vis 2](./vis-2.png)

The second vis tries to look at the data holistically by plotting the symptoms
recorded at each encounter both before and after the injury. The task is to gain
an overall understanding of the data and begin to identify trends of
symptom/injury relationships.

This vis took by far the longest. As described above, it started with
manipulating the data to captures the hierarchy of symptoms belonging to
encounters which in turn belong to patients.

I then worked on displaying each encounter by time relative
to the injury and age of the patient at the time of injure. I made some changes
to the vertical axis to group patients into age groups rather than by specific age.
The age is still captured by patient order, but the grouping prevents overlaps
across patients. As an added bonus, the vis captures age demographic information
by the width of each of the groups.

Finally, I added the symptoms at each encounter, coded using color. With 12
symptoms (stress was excluded as it was false for all patients/encounters), this
is pushing the limits describing categorical data with color. Additionally, the
encounters are very dense and so there is a lot of overlap between symptom
dots.

Still, you can pick up on trends of encounter density after injuries for some
patients, whereas others already were having many encounters. Similarly with
symptoms, some patients and a pretty strong increase in symptoms starting right
after the injury, while others had many symptoms before the injury as well.

### Vis 3

... [ steps to produce your images ]

### Vis 4

... [ steps to produce your images ]

### The Good and the Bad

#### Tableau

Tableau tries to classify the different types of data and can make inferences
and suggest ways to visualize based on those data types.

 - **Good**: Tableau detects the data types and based on that can structure
   visualizations appropriately.
 - **Good**: Simple yet powerful drag and drop interface.
 - **Bad**: If the data structure is not straight forward, it's difficult to
   manipulate Tableau to capture the data correctly.

#### D3

With D3, you describe every aspect of going from data to visualization. In my
experience, this is the reason for both the good and the bad. 

 - **Good**: D3 is extremely flexible and you can describe every aspect.
 - **Good**: Because you are describing every aspect, you maintain a very clear
   awareness of how the data is being maipulated and the vis is being
   generated.
 - **Bad**: D3 only gives you convenience functions for data manipulation,
   binding data, and describing how the data gets transformed into the visual
   form. This leaves a lot of work to the person creating the vis. 



