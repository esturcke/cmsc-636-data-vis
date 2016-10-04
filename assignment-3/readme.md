# Assignment 3: MultiD with Parallel Coordinates: Overview Technique

[Assigment statement](https://sites.google.com/a/umbc.edu/datavisualization/assignments/assignment-3)

## Part 1: Design

### Group Names

 - Kyle Boyer
 - Erik Sturcke

### Group Idea: Edge Bundling

Inspired by [hierarchical edge bundling](https://bl.ocks.org/mbostock/7607999)
discussed in class, our group idea was to use similar techniques to group
similar edges between parallel coordinate axes. The idea is that this would
remove some of the clutter, expecially when view all data points, and help
identify general trends in the data.

This would primarily hope to address issue (2):

> 2). The therapy results are overlaid on top of each other which introduces
> clutter. The body responses can be hierarchical - some responses are similar.
> How do you visually represent something similar? How might you group those
> similar items with aggregation and how to represent such an aggregation.

To some extend cleaning up the graphs might also help see bimodal distributions
clearer as long as the bundling is done in such a way that a single therapy may
potentially split and bundle towards multiple areas. I’m not sure what it would
entail to do this.

## Part 2: Implementation
