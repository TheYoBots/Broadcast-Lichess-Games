const fetch = require('node-fetch')
const express = require('express')
const path = require('path')

const app = express()

const PORT = parseInt(process.env.PORT || "3000")

const APP_NAME = "Express Hello World"

const relayUrl = process.env.RELAY_URL
const maxGames = parseInt(process.env.MAX_GAMES || "1")
const broadcastId = process.env.BROADCAST_ID

let allPgns = Array(maxGames).fill(process.env.DEFAULT_PGN || `[Event "Rated UltraBullet game"]
[Site "https://lishogi.org/TMH4ve5F"]
[Date "2021.06.18"]
[Sente "JapaneseChessisgr8"]
[Gote "YohaanSethNathan"]
[Result "0-1"]
[UTCDate "2021.06.18"]
[UTCTime "20:03:01"]
[SenteElo "1688"]
[GoteElo "1463"]
[SenteRatingDiff "-21"]
[GoteRatingDiff "+17"]
[SenteTitle "BOT"]
[Variant "Standard"]
[TimeControl "15+0+0(1)"]
[ECO "?"]
[Termination "Time forfeit"]

1. Gf1e2 Pg6 2. Kf1 Pf6 3. Pe4 Rf8 4. Pc4 Kd8 5. Sf2 Kc8 6. Sd2 Kb8 7. Sf2e3 Gc8 8. Bd4 Ge8 9. Pe5 Gf7 10. Se4 Sg8 11. Pi4 Sg7 12. Nc3 Pi6 13. Be3 Pe6 14. Pxe6 Gxe6 0-1
`)

let cachedPgns = []

function fetchOngoing(nowPlaying){
	if(broadcastId){
		let burl = `https://lishogi.org/broadcast/-/${broadcastId}/push`
		
		console.log("pushing to", burl)
		
		fetch(burl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.TOKEN}`
			},
			body: allPgns.join("\n\n").replace(/\n\n+/g, "\n\n")
		}).then(response => response.text().then(content => console.log("push response", content)))
	}
	
	for(let i = 0; i < nowPlaying.length; i++){
		let game = nowPlaying[i]
		const url = `https://lishogi.org/game/export/${game.gameId}`
		console.log("loading", url)
		setTimeout(_ => fetch(url).then(response => response.text().then(content => {
			allPgns[i] = content
			console.log("loaded", i)
		})), i * 2000)
	}
	
	for(let i = nowPlaying.length; i < maxGames; i++){
		let index = i - nowPlaying.length
		
		if(index < cachedPgns.length){			
			allPgns[i] = cachedPgns[index]
		}
	}
}

function fetchNowPlaying(){
	fetch(`https://lishogi.org/api/account/playing`, {
		headers: {
			Authorization: `Bearer ${process.env.TOKEN}`
		}
	}).then(response => response.text().then(content => {
		let blob = JSON.parse(content)		
		let nowPlaying = blob.nowPlaying		
		if(nowPlaying.length > maxGames) nowPlaying = nowPlaying.slice(0, maxGames)
		console.log("now playing", nowPlaying.length)
		fetchOngoing(nowPlaying)
	}))	
}

if(process.env.TOKEN){
	if(relayUrl) fetch(relayUrl).then(response => response.text().then(content => {
		cachedPgns = content.split("\n\n\n")
		
		console.log("fetched cache", cachedPgns.length)
	}))	
	
	setTimeout(_ => fetchNowPlaying(), 10000)
	
	setInterval(_ => {
		fetchNowPlaying()
	}, maxGames * 3000)
}

app.get('/', (req, res) => {
	if(!relayUrl){
		res.send("no relay url")	
		
		return
	}
	
	fetch(relayUrl).then(response => response.text().then(content => {
		res.send(content)
	}))	
})

app.get('/ongoing', (req, res) => {	
	res.send(allPgns.join("\n\n").replace(/\n\n+/g, "\n\n"))
})

app.use('/', express.static(path.join(__dirname, '/')))

app.listen(PORT, _ => {
	console.log(`${APP_NAME} listening on port ${PORT}`)
})
