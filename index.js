const bodyParser = require('body-parser')
const express = require('express')

const app = express()

app.use(bodyParser.json())

app.set('port', process.env.PORT || 5000)

app.get('/', (req, res) => {
  res.send('Hello')
})

app.post('/', (req, res) => {
  res.send(req.body && req.body.challenge)
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
