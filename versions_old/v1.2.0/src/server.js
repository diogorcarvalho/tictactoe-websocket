const fs = require('fs')
const http = require('http')
const WebSocketServer = require('websocket').server
const port = 9898

const server = http.createServer((req, resp) => {
  //const path = `${__dirname}/public${req.url}`
  const path = `./public${req.url}`
  fs.readFile(path, (error, data) => {
    if (error) {
      resp.writeHead(404).end(JSON.stringify(error))
      return
    }
    if (req.url.includes('.html')) {
      resp.writeHead(200, { 'Content-type': 'text/html' })
    } else if (req.url.includes('.css')) {
      resp.writeHead(200, { 'Content-type': 'text/css' })
    } else if (req.url.includes('.js')) {
      resp.writeHead(200, { 'Content-type': 'text/javascript' })
    }
    resp.write(data)
    resp.end()
  })
})
.listen(port, (error) => {
  if (!!error) return console.log('Ocorreu algum erro:', error)
  console.log(`Serviço funcionando na porta: ${port}`)
})

const wsServer = new WebSocketServer({ httpServer: server })

const PlayerState = {
  'InSetupPlayerName': 1,
  'CreateOrEnterRoom' : 2,
  'InsideRoom': 3
}

class Player {
  constructor(playerKey, playerName, connection) {
    this.playerKey = playerKey
    this.playerName = playerName
    this.playerState = PlayerState.InSetupPlayerName
    this.connection = connection
  }

  map() {
    return {
      playerKey: this.playerKey,
      playerName: this.playerName,
      playerState: this.playerState
    }
  }
}

class Room {
  constructor(player, roomName) {
    this.roomName = roomName
    this.players = [ player ]
  }
  
  map() {
    return {
      roomName: this.roomName,
      players: this.players.map(player => player.map())
    }
  }
}

class GameApp {
  constructor() {
    this.players = []
    this.rooms = []
  }

  addPlayer(player) {
    
    this.players.push(player)
    
    this.contextUpdate()
  }

  setPlayerName(playerKey, playerName) {
    playerName = playerName.trim()

    // Checa se já existe outro jogador com o nome requisitado
    const _existingPlayer = this.players.find(player => player.playerName === playerName && player.playerKey !== playerKey)
    
    if (!!_existingPlayer) return this.sendAlertTo(playerKey, 'Atenção', `Já existe um jogador usando o nome "${playerName}".`, 'error')
    
    const _player = this.players.find(player => player.playerKey === playerKey)
    
    _player.playerName = playerName

    _player.playerState = PlayerState.CreateOrEnterRoom

    this.contextUpdate()
  }

  enterRoom(playerKey, roomName) {
    const _player = this.players.find(player => player.playerKey === playerKey)
    
    const _room = this.rooms.find(room => room.roomName === roomName)
    
    _room.players.push(_player)

    _player.playerState = PlayerState.InsideRoom
    
    this.contextUpdate()
  }

  leaveRoom(playerKey) {
    const _rooms = this.rooms.filter(room => !!room.players.find(player => player.playerKey === playerKey))
    
    _rooms.forEach(room => {
      room.players = room.players.filter(player => player.playerKey !== playerKey)
    })
    
    this.rooms = this.rooms.filter(room => room.players.length !== 0)

    const _player = this.players.find(player => player.playerKey === playerKey)

    _player.playerState = PlayerState.CreateOrEnterRoom

    this.contextUpdate()
  }

  removePlayer(playerKey) {
    // Obtem todos os rooms onde o jogador se encontra.
    const _rooms = this.rooms.filter(room => !!room.players.find(player => player.playerKey === playerKey))
    
    // Remove o jogador de todas as salas obitidas anteriormente.
    _rooms.forEach(room => room.players = room.players.filter(player => player.playerKey !== playerKey))

    // Remove as salas vazias.
    this.rooms = this.rooms.filter(room => room.players.length !== 0)

    // Remove o jogador da lista de jogadores.
    this.players = this.players.filter(player => player.playerKey !== playerKey)

    this.contextUpdate()
  }

  createRoom(playerKey, roomName) {
    roomName = roomName.trim()
    
    const _room = this.rooms.find(room => room.roomName === roomName)
    
    if (!!_room) return this.sendAlertTo(playerKey, 'Atenção', `Já há uma sala com o nome: "${roomName}"`, 'error')
    
    const _player = this.players.find(player => player.playerKey === playerKey)
    
    this.rooms.push(new Room(_player, roomName))

    _player.playerState = PlayerState.InsideRoom
    
    this.contextUpdate()
  }

  contextUpdate() {
    const _context  = {
      rooms: this.rooms.map(room => room.map()),
      player: undefined,
    }
    this.players.forEach(player => {
      const _ctx = {
        ..._context,
        player: player.map(),
      }
      player.connection.sendUTF(JSON.stringify({ command:'context_update', context: _ctx }))
    })
  }

  sendAlertTo(playerKey, title, text, alertType) {
    
    const _player = this.players.find(player => player.playerKey === playerKey)
    
    _player.connection.sendUTF(JSON.stringify({ command: 'alert', title, text, alertType }))
  }
}

const game = new GameApp()

wsServer.on('request', request => {

  const connection = request.accept(null, request.origin)

  game.addPlayer(new Player(request.key, undefined, connection))

  connection.on('message', message => {
    const payload = JSON.parse(message.utf8Data)
    
    if (payload.command === 'set_player_name') {
      game.setPlayerName(request.key, payload.playerName)
    }

    if (payload.command === 'enter_room') {
      return game.enterRoom(request.key, payload.roomName)
    }

    if (payload.command === 'leave_room') {
      return game.leaveRoom(request.key)
    }
    
    if (payload.command === 'create_room') {
      return game.createRoom(request.key, payload.roomName)
    }
  })

  connection.on('close', (reasonCode, description) => {
    game.removePlayer(request.key)
  })

  connection.on('error', error => {
    // TODO
  })
})