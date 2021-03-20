const fetch = require('node-fetch')
const express = require('express')
const path = require('path')

const app = express()

const PORT = parseInt(process.env.PORT || "3000")

const APP_NAME = "Express Hello World"

const relayUrl = process.env.RELAY_URL
const maxGames = parseInt(process.env.MAX_GAMES || "1")
const broadcastId = process.env.BROADCAST_ID

let allPgns = Array(maxGames).fill(process.env.DEFAULT_PGN || `[Event "Rated Bullet game"]
[Site "https://lichess.org/roF5tSg1"]
[Date "2021.01.20"]
[White "YoBot_v2"]
[Black "ResoluteBot"]
[Result "1-0"]
[UTCDate "2021.01.20"]
[UTCTime "15:32:53"]
[WhiteElo "2564"]
[BlackElo "2851"]
[WhiteRatingDiff "+10"]
[BlackRatingDiff "-10"]
[WhiteTitle "BOT"]
[BlackTitle "BOT"]
[Variant "Standard"]
[TimeControl "30+0"]
[ECO "A45"]
[Opening "Indian Game"]
[Termination "Time forfeit"]
[Annotator "lichess.org"]

1. d4 Nf6 { A45 Indian Game } 2. e3 e6 3. c4 Be7 4. Nf3 O-O 5. b3 c5 6. dxc5 Na6 7. Be2 Nxc5 8. Nc3 Nfe4 9. Nxe4 Nxe4 10. O-O Bf6 11. Nd4 Nc3 12. Qc2 Nxe2+ 13. Qxe2 d5 14. cxd5 Qxd5 15. Rd1 Bd7 16. Bb2 Qa5 17. Nf3 Bb5 18. Qd2 Qxd2 19. Rxd2 Bxb2 20. Rxb2 Rfd8 21. Nd4 Be8 22. f4 Rac8 23. Kf2 a5 24. Re1 h6 25. Ree2 g5 26. Nf3 f6 27. h4 gxh4 28. Nxh4 Bc6 29. Nf3 Be4 30. Red2 Rd5 31. Rxd5 Bxd5 32. Nd2 Rc3 33. a4 Kg7 34. e4 Bc6 35. b4 axb4 36. Rxb4 Ra3 37. Nb3 Rxa4 38. Rxa4 Bxa4 39. Nc5 Bc6 40. Nxe6+ Kh7 41. e5 fxe5 42. fxe5 Kg6 43. Nd4 h5 44. e6 Kf6 45. g4 hxg4 46. Kg3 Ba4 47. Kxg4 Ke5 48. Nf3+ Kxe6 49. Kf4 Kd5 50. Ke3 Kc4 51. Nd2+ Kc3 52. Ne4+ Kb4 53. Kd4 b6 54. Nf6 Bc6 55. Ng4 b5 56. Ne5 Be8 57. Nd3+ Ka3 58. Kc5 Bd7 59. Nb4 Ka4 60. Nd3 Ka5 61. Ne5 Be8 62. Nd3 Ka4 63. Nb4 Bh5 64. Nd3 Bg6 65. Nb4 Bb1 66. Nd5 Bd3 67. Nb4 Bb1 68. Nd5 Bd3 69. Nc3+ Ka5 70. Nd5 Bc2 71. Nb4 Bb1 72. Nc6+ Ka4 73. Nb4 Bg6 74. Nd5 Ka5 75. Nb4 Bb1 76. Nc6+ Ka4 77. Nb4 Bg6 78. Nd5 Be8 79. Nb4 Bf7 80. Na6 Bg6 81. Nb4 Bf7 82. Nc6 Bc4 83. Kd4 Ka3 84. Kc5 Kb3 85. Nb4 Ka4 86. Nc6 Ka3 87. Nb4 Bf1 88. Nc6 Bd3 89. Kd4 Bc4 90. Kc3 Bd5 91. Nb4 Be4 92. Na6 Bc6 93. Nb4 Be4 94. Na6 Bf3 95. Nb4 Bd1 96. Nd5 Ka4 97. Kb2 b4 98. Nf6 Bf3 99. Ne8 Ka5 100. Nd6 Bg4 101. Nc4+ Kb5 102. Nd6+ Kc6 103. Nc4 Kb5 104. Nd6+ Kc5 105. Nb7+ Kb6 106. Nd6 Ka5 107. Nc4+ Ka4 108. Nb6+ Kb5 109. Nd5 Kc5 110. Ne3 Be6 111. Nf1 Bg8 112. Ng3 Bd5 113. Kc2 Bc4 114. Kb2 Kc6 115. Ne4 Bf1 116. Nd2 Be2 117. Kb3 Kb5 118. Kb2 Bh5 119. Kb3 Bd1+ 120. Kb2 Bh5 121. Kb3 Bd1+ 122. Ka2 Ba4 123. Kb1 Kc5 124. Kb2 Bc6 125. Nb3+ Kd6 126. Na5 Bd5 127. Nb3 Kc7 128. Nc1 Kb6 129. Ne2 Kc5 130. Nf4 Bc4 131. Ng6 Bd3 132. Ne7 Bb5 133. Ng6 Bf1 134. Ne7 { White wins on time. } 1-0
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
