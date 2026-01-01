const express = require('express')
const app = express()
const port = 3000
const router = require('./routes')
const { setupCronJobs } = require('./scheduler/cronJobs') // Uncomment to enable auto set absent

app.use(express.json())
app.use(express.urlencoded({extended : false}))

app.use(router)

// Setup cron jobs for auto set absent
// Uncomment the line below to enable automatic absent marking
setupCronJobs()

app.listen(port, () => {
  console.log(`running on port http://localhost:${port}`)
})
