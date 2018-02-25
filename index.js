const bodyParser = require('body-parser')
const express = require('express')
const moment = require('moment-timezone')
const slack = require('slack')

const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN
const OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN

const app = express()

app.use(bodyParser.json())

app.set('port', process.env.PORT || 5000)

app.get('/', (req, res) => {
  res.send('Hello')
})

app.post('/', async (req, res) => {
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

  if (req.body.event && req.body.event.type === 'message') {
    res.end()
    await handleMessage(req.body.event.text || '')
    return
  }

  res.end()
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})

async function handleMessage (text) {
  if (!text.match(/\b(kana|@kana|U1UP30NRL)\b/)) {
    return
  }

  const p = await usersProfileGet()
  const statusText = p.profile.status_text || ''

  const m = statusText.match(/^(\d+)個レビューしてる\((.*)\)$/) || []
  const statusCount = parseInt(m[0] || '0', 10)
  const currentDate = moment().tz('Japan').format('M/D')
  const statusDate = m[1] || currentDate

  const moreCount = (text.match(/https:\/\/github\.com\/YOUR_ORGANIZATION\/[^\/]+\/pull\/\d+/g) || []).length
  const newCount = currentDate === statusDate ? statusCount + moreCount : moreCount

  const emojiTable = {
    0: ':zero:',
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
    6: ':six:',
    7: ':seven:',
    8: ':eight:',
    9: ':nine:',
    10: ':keycap_ten:'
  }
  const emoji = emojiTable[newCount] || ':waving_white_flag:'

  usersProfileSet({
    status_emoji: emoji,
    status_text: `${newCount}個レビューしてる(${currentDate})`
  })
}

async function usersProfileGet () {
  return await slack.users.profile.get({
    token: OAUTH_ACCESS_TOKEN
  });
}

async function usersProfileSet (statusData) {
  return await slack.users.profile.set({
    token: OAUTH_ACCESS_TOKEN,
    profile: JSON.stringify(statusData)
  });
}
