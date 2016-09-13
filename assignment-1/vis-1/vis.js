const DATA = "./ehr.json"

d3.json(DATA, (error, patients) => {
  if (error) throw error
  console.info(patients)
})
