const getUrls = require('get-urls')
const Airtable = require('airtable')

const PUBLISH_MESSAGE_ON_LINK = false
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

require('isomorphic-fetch')

function createSnitch (slack) {

  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.API_KEY
  })

  let base = new Airtable({ AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)

  const showError = (error) => {
    console.error(error)
  }

  const isDuplicated = (URL) => {
    let found = false

    return new Promise((resolve, reject) => {
      base(process.env.AIRTABLE_BASE).select({
        maxRecords: 5,
        sort: [{field: "date", direction: "desc"}]
      }).firstPage(function(err, records) {
        if (err) { 
          console.error(err); 
          reject()
        }
        records.forEach(function(record) {
          console.log(URL, record.get('URL'))

          if (URL === record.get('URL')) {
            found = true
          }
        })
        resolve(found)
      })
    })
  }

  const addLinkToTable = (event, text, urls, slackChannel, user) => {
    let channel = slackChannel.name
    let username = user.name
    let channelID = slackChannel.id
    let tags = extractTags(text)
    let date = new Date(event.ts * 1000).toLocaleString()
    let URL = urls[0]

    if (URL) {
      URL = URL.replace('%3E', '')
    }    

    let reURL = new RegExp(`<http(.*?)>`, 'gi')
    let description = text.replace(reURL, '')

    if (tags && tags.length) {
      tags.forEach((tag) => {
        let r = new RegExp(`#${tag}`, 'gi')
        description = description.replace(r, '')
      })

      tags.forEach((tag) => {
        let r = new RegExp(`<(.*?)>`, 'gi')
        description = description.replace(r, '')
      })
    }

    createLink(date, tags, username, description, slackChannel, URL)
  }

  const createLink = (date, tags, username, description, channel, URL, other_tags = null) => {

    const onLinkAdded = (err, record) => {
      if (err) { 
        console.error(err) 

        if (err.error === 'INVALID_VALUE_FOR_COLUMN') {
          createLink(date, null, username, description, channel.name, URL, tags.join(' '))
        }
        if (err.error === 'INVALID_MULTIPLE_CHOICE_OPTIONS') {
          createLink(date, null, username, description, channel.name, URL, tags.join(' '))
        }

        return
      }
    }

    isDuplicated(URL).then((duplicated) => {
      if (!duplicated) {
        base(process.env.AIRTABLE_BASE).create({ date, tags, username, description, channel, URL, other_tags }, onLinkAdded)
      }
    })
  }

  const generateMessage = (channelID, message = null) => {
    return {
      unfurl_links: true,
      channel: channelID,
      token: process.env.BOT_TOKEN,
      text: message || ':)'
    }
  }

  const sendReply = (channelID, text) => {
    let message = generateMessage(channelID, text)

    slack.send(message).then(data => {
      console.log('response', data)
    })
  }

  const sendMessage = (channelID) => {
    if (PUBLISH_MESSAGE_ON_LINK) {
      let message = generateMessage(channelID)

      slack.send(message).then(data => {
        console.log('response', data)
      })
    }
  }

  const recordMessage = (event, channel, user, text) => {
    let urls = extractURLs(text)
    addLinkToTable(event, text, urls, channel, user)
  }

  const extractTags = (text) => {
    let tags = []
    let matches = text.match(/<#.*?\|(.*?)>|#(\w+)/gi)

    if (matches && matches.length) {
      matches.forEach((m) => {
        let tag = m.match(/<#.*?\|(.*?)>|#(\w+)/)
        tags.push(tag[1] || tag[2])
      })
    }

    return tags
  }

  const extractURLs = (text) => {
    try {
      return Array.from(getUrls(text)).map((i) => { return i.replace(/>$/, '') })
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return {
    createLink,
    extractURLs,
    showError,
    recordMessage
  }
}

module.exports = createSnitch
