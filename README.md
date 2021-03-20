# Broadcast Lichess Games

An easy way to Broadcast/Relay lichess games from a live url using heroku.

## How to Use

- Fork this repository on GitHub.
- Login/Sign up to [heroku](https://signup.heroku.com) Create a new [heroku app](https://dashboard.heroku.com/new-app).
- Go to the `Deploy` tab in heroku and click `Connect to GitHub` (Make sure your GitHub account is authorised to access heroku).
- Click on `search` and select your fork of this repository.
- Then `Enable Automatic Deploys` and then `Deploy Branch`. Make sure you choose the `master` branch to deploy.
- Then go to the `Settings` in heroku and scroll down and click on `Reveal Config Vars` and add the necessary Config Vars from [here](https://github.com/TheYoBots/Broadcast-Lichess-Games#configuration-variables).
- Now click on `Open app` in heroku and save this link as you will need it soon for your broadcast.
- Now go to Lichess and [create a new broadcast](https://lichess.org/broadcast/new). Add your Event Name, Description and all other required details for your broadcast. In the `Source URL, or game IDs` field in your broadcast add the link that you had saved when you clicked on `Open app` in heroku. Now click on `SUBMIT` in lichess and then click `CLICK TO CONNECT` and your broadcast is now ready!!

### Configuration Variables (Config Vars)

Set the following environment variables ( Heroku Config Vars ) in heroku.

**Do note that all the variables mentioned below are in the format `key=value`**

**`RELAY_URL`**

Your PGN source url. For live broadcasts, you need the live PGN url. 

If you would like to get the live games of a particular user set this to `https://lichess.org/api/user/<username>/current-game` where you replace `<username>` with the username whos live games you would like to get.

To get your own live games, you can simply add the `TOKEN` config var, but the above can be used to get another users live games or live games from a live PGN source.

**`TOKEN`**

Your [Lichess API Access Token](https://lichess.org/account/oauth/token/create?scopes[]=study:write&description=Broadcasting+Token). This is required if you want to relay your ongoing games or live games. Make sure broadcast scopes are selected. Adding this increases the number of requests sent to lichess. 

**`MAX_GAMES`**

Maximum number of your ongoing games to relay `( default : 1 )`.

**`BROADCAST_ID`**

Broadcast id of your Lichess Broadcast. Your broadcast link should look something like `https://lichess.org/broadcast/<event-name>/<Broadcast ID>`. The digits in the place of `<Broadcast ID>` is what you place for this config var. Adding this increases the number of requests to lichess.

## Usage

Server is started with `node server.js`.

Endpoint `/` path will relay the games you specified in `RELAY_URL`.

If you provide your API access token, then endpoint `/ongoing` will relay your ongoing games. An attempt will be made to initialize ongoing games from `RELAY_URL` if it is set. If you provide a `BROADCAST_ID`, then your ongoing games will be pushed to your broadcast ( in this case `TOKEN` must have broadcast scopes ).

**Note: Live games of a particular user of another user is made 3 moves behind by lichess to prevent cheating by using the live analysis feature. Attempting to do so using this will not work as this is taken directly from Lichess' API. All precautions have been taken against users using this for any kind of cheat methods.**

**Note: Since Lichess Broadcast updates to the link every 3-5 seconds, all moves in fast games (bullet and blitz) will take longer to update.

**Also using this under your own name without providing credits to the Author is completely discouraged. This Repositiory is run under the MIT License.**
