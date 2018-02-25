const bodyParser = require('body-parser')
const express = require('express')

const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN

const app = express()

app.use(bodyParser.json())

app.set('port', process.env.PORT || 5000)

app.get('/', (req, res) => {
  res.send('Hello')
})

app.post('/', (req, res) => {
  if (!req.body) {
    res.end()
    console.log('missing body')
    return
  }

  if (req.body.token !== VERIFICATION_TOKEN) {
    res.end()
    console.log('invalid token')
    return
  }

  if (req.body.challenge) {
    return res.send(req.body.challenge)
  }
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
