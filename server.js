const fetch = require('node-fetch')
const express = require('express')
const path = require('path')

const app = express()

const PORT = parseInt(process.env.PORT || "3000")

const APP_NAME = "Express Hello World"

const relayUrl = process.env.RELAY_URL
const maxGames = parseInt(process.env.MAX_GAMES || "1")
const broadcastId = process.env.BROADCAST_ID

let allPgns = Array(maxGames).fill(process.env.DEFAULT_PGN || `[Event "Rated Blitz game"]
[Site "https://lichess.org/wjHniyF7"]
[Date "2020.12.05"]
[White "chesshyperbot"]
[Black "Virutor"]
[Result "1-0"]
[UTCDate "2020.12.05"]
[UTCTime "08:22:22"]
[WhiteElo "2425"]
[BlackElo "1730"]
[WhiteRatingDiff "+0"]
[BlackRatingDiff "-1"]
[WhiteTitle "BOT"]
[BlackTitle "BOT"]
[Variant "Standard"]
[TimeControl "300+0"]
[ECO "D37"]
[Opening "Queen's Gambit Declined: Harrwitz Attack"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bf4 { D37 Queen's Gambit Declined: Harrwitz Attack } dxc4 6. e3 Nh5 7. Be5 f6 8. Bg3 Nxg3 9. hxg3 b5 10. Nxb5 c6 11. Nc3 Qb6 12. Bxc4 Qxb2 13. Ne2 Qb4+ 14. Nd2 e5 15. Qc2 exd4 16. Nxd4 c5 17. Rb1 Qxb1+ 18. Nxb1 cxd4 19. Qe4 dxe3 20. Qxa8 exf2+ 21. Kxf2 Bc5+ 22. Kf3 Bd6 23. Re1+ Kf8 24. Qd5 Bg4+ 25. Kxg4 h5+ 26. Kf3 Bxg3 27. Qf7# { White wins by checkmate. } 1-0
`)

let cachedPgns = []

function fetchOngoing(nowPlaying){
	if(broadcastId){
		let burl = `https://lichess.org/broadcast/-/${broadcastId}/push`
		
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
		const url = `https://lichess.org/game/export/${game.gameId}`
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
	fetch(`https://lichess.org/api/account/playing`, {
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
