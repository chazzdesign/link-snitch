LinkSnitch
==========

Store the URLs shared in Slack in an Airtable base.

### How to install it

The installation process requires you to: 

1. Create a glitch project.
2. Create a bot in Slack and copy the tokens/credentails.
3. Create a base in Airtable and copy the tokens/credentials.
4. Invite the bot to the Slach channels you want to monitor.

### Creating a Glitch project

*In this step you'll create a Glitch project that will host a server to handle the communications between your Slack bot and your Airtable base.*

1. Fork this repo.
2. Go to your [glitch.com](https://glitch.com) dashboard.
3. Create a new "hello-express" project.
4. Open the project options and click on "Advanced options".
5. Grant access to your GitHub account.
6. Click on "Import from GitHub".
7. In the prompt window write the path to the repo in github: `username/link-snitch`.
8. Using the glitch browser to copy the contents of the `env.sample` file and use it to replace the contents of the secret `.env` file.

#### Creating a bot in Slack

*In this step you'll create and setup a bot that will look for links in the messages of the Slack channels you invite it in.*

1. Go to [api.slack.com](https://api.slack.com).
2. Click on `Create New App`.
3. Add a name for the bot and pick your Slack.
4. In the `Add features and functionality` section click on `Bots. Add a bot to allow users to exchange messages with your app.`
5. Click on `Add a bot user`.
6. Configure your bot details and create it.
7. Go to `Basic Information`.
8. Copy the **Verification Token** → `SLACK_VERIFICATION_TOKEN`.
9. and click `Install App to Workspace`.
8. Click on `OAuth & Permissions` and copy the **Bot User OAuth Access Token** → `SLACK_BOT_TOKEN`.
9. Go to `Event Subscriptions` and enable the events.
10. In `Request URL` paste the URL of your Glitch project: `https://name-of-the-project.glitch.me`.
11. Scroll down to `Subscribe to Bot Events` and click on `Add Bot User Event`.
12. Look for the `message.channels` event and select it.

#### Creating a base in Airtable

*In this step you'll create and setup an Airtable base to collect all the links*

1. Go to [Airtable](https://airtable.com) and create a new base using `Import a spreadsheet`
2. Pick the option to create the table using a CSV file and use the [aritable.csv](airtable.csv) file in this repo
3. Rename the base and copy that **name** → `AIRTABLE_BASE_NAME`
4. Go to [your account](https://airtable.com/account) and copy the **API key** → `AIRTABLE_API_KEY`

#### Inviting the bot to the Slack channels

Once you've finished the setup of the bot, enter in any channel and invite the bot using the following command:

`/invite @name-of-your-bot`

To test that everything it's working fine, write a link in the channel and see if it was inserted in Airtable.


