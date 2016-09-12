d3.json("https://raw.githubusercontent.com/esturcke/cmsc-636-data-vis/master/assignment-1/data/ehr.json", (error, patients) => {
  if (error) throw error
  console.info(patients)
})
