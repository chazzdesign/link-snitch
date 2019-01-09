// require('dotenv').config()

const express = require('express')
const tinyspeck = require('tinyspeck')
const { WebClient } = require('@slack/client')
const web = new WebClient(process.env.SLACK_BOT_TOKEN)

const slack = tinyspeck.instance({
  token: process.env.SLACK_BOT_TOKEN
})

const Snitch = require('./snitch')(slack)

const MESSAGE_TYPE_BOT = 'bot_message'

let app = express()

app.use(express.static('public'))

const onMessage = function (message) {
  if (!message || message && !message.text) {
    return
  }

  let event = message.event

  if (event && event.subtype !== MESSAGE_TYPE_BOT) {
    getUserFromUserID(event.user).then((user) => {
      getChannelName(event.channel)
        .then((channel) => {
          Snitch.recordMessage(event, channel.channel, user.user, message.text)
        })
    })
  } 
}

const getChannelName = (id) => {
  return web.channels.info({ channel: id })
}

const getUserFromUserID = (id) => {
  return web.users.info({ user: id })
}

slack.on('message', onMessage)
slack.listen(process.env.PORT, process.env.SLACK_VERIFICATION_TOKEN)