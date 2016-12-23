# Assignment 5: Highlight Temporal Trajectories

[Assigment statement](https://sites.google.com/a/umbc.edu/datavisualization/assignments/assignment-5)  
[Live Demo](https://maiholz.org/temporal-trajectories/)

## Setup

This projects requires [`Yarn`](https://yarnpkg.com/) (or npm) to install dependencies using:

```
yarn
```

## Preprocessing

### Assumptions

Given a sequence `A → B`, we have to search for encounter trajectories where
the patient exhibited the given symptoms. I will assume that we are not
considering co-occurrence of the symptoms to be a trajectory, but that symptoms
need not be for consecutive encounters. I will also assume that when looking
for multiple trajectories, they may overlap. A single trajectory, however, will
not be allowed to overlap with itself. When considering the extend of a
trajectory, the only the nearest symptoms are considered part.

For example when looking for

```
1. A → B
2. C → B
3. D → E
```

in 

```
AACBCDEB
```

the trajectories would be

```
A[ACB]CDEB 1
AA[CB]CDEB 2
AACBC[DE]B 3
AACB[CDEB] 2  
```

The order of the trajectories is determined by the completion of the trajectory.

### Finding Trajectories

The code to find the trajectories is in
[`src/lib/trajectories.js`](src/lib/trajectories.js). Given a
`from` and `to` symptom along with the `ehs.json` patient data, this code finds
all the transition encounter pairs for the trajectory.

The trajectory data is written to
[`data/trajectories.json`](data/trajectories.json) via
[`tools/trajectories.js`](tools/trajectories.js) and can be run via:

```bash
yarn trajectories
```

## Visualization

![Symbols](symbols.png)

## Critical Evaluation

## Extra Credit

Clicking on a row in the legend allows the user to pick the pattern to mark
with the symbol.

![Assigning a symbol to a pattern](assign-pattern.png)
