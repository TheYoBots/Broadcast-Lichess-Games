# Broadcast Lichess Games

An easy way to Broadcast/Relay lichess games from a live url using heroku.

## Configuration

Set environment variables ( Heroku config vars ) as follows.

### RELAY_URL

Your PGN source url.

### TOKEN

Your lichess API access token ( required if you want to relay your ongoing games ).

### MAX_GAMES

Maximum number of your ongoing games to relay ( default : 1 ).

### BROADCAST_ID

Broadcast id of your lichess broadcast.

## Usage

Start server with `node server.js`.

Endpoint `/` path will relay the games you specified in RELAY_URL.

If you provide your API access token, then endpoint `/ongoing` will relay your ongoing games. An attempt will be made to initialize ongoing games from RELAY_URL if it is set. If you provide a BROADCAST_ID, then your ongoing games will be pushed to your broadcast ( in this case TOKEN must have broadcast scopes ).
