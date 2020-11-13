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

class Player {
  constructor(key, connection, userName) {
    this.key = key
    this.connection = connection
    this.userName = userName
  }

  map() {
    return { key: this.key, userName: this.userName }
  }
}

class Room {
  constructor(player, roomName) {
    this.roomName = roomName
    this.players = [ player ]
  }
}

class GameApp {
  constructor() {
    this.players = []
    this.rooms = []
  }

  setUserName(key, userName) {
    userName = userName.trim()
    const _player = this.players.find(p => p.userName === userName)
    if (!!_player) return this.sendAlertTo(key, 'Atenção', `O nome "${userName}" já está em uso por outro jogador.`, 'error')
    const player = this.players.find(p => p.key === key)
    player.userName = userName
    player.connection.sendUTF(JSON.stringify({ type:'set_user_name', userName }))
    this.sendBroadcastPlayers()
    this.sendBroadcastRooms()
  }

  addPlayer(player) {
    this.players.push(player)
    this.sendBroadcastPlayers()
    this.sendBroadcastRooms()
  }

  removePlayer(key) {
    const _rooms = this.rooms.filter(r => !!r.players.find(p => p.key === key))
    if (!!_rooms && !!_rooms.length) {
      _rooms.forEach(room => {
        room.players = room.players.filter(p => p.key !== key)
      })
    }
    this.rooms = this.rooms.filter(room => room.players.length > 0)
    this.players = this.players.filter(p => p.key !== key)
    this.sendBroadcastPlayers()
    this.sendBroadcastRooms()
  }

  getPlayers = () => this.players.map(p => p.map())

  sendBroadcastPlayers() {
    const players = this.getPlayers()
    this.players.forEach(player => player.connection.sendUTF(JSON.stringify({ type: 'players', players })))
  }

  createRoom(key, roomName) {
    roomName = roomName.trim()
    const _room = this.rooms.find(r => r.roomName === roomName)
    if (!!_room) return this.sendAlertTo(key, 'Atenção', `Já há uma sala com o nome: "${roomName}"`, 'error')
    const _player = this.players.find(p => p.key === key)
    this.rooms.push(new Room(_player, roomName))
    _player.connection.sendUTF(JSON.stringify({type:'create_room', roomName}))
    this.sendBroadcastRooms()
  }

  getRooms = () => this.rooms.map(room => ({ roomName: room.roomName, players: room.players.map(player => player.map()) }))

  sendBroadcastRooms() {
    const rooms = this.getRooms()
    this.players.forEach(p => p.connection.sendUTF(JSON.stringify({ type: 'rooms', rooms })))
  } 

  leaveRoom(key, roomName) {
    const _room = this.rooms.find(room => room.roomName === roomName)
    _room.players = _room.players.filter(player => player.key !== key)
    if (_room.players.length === 0) {
      this.rooms = this.rooms.filter(room => room !== _room)
    }
    this.sendBroadcastPlayers()
    this.sendBroadcastRooms()
  }

  enterRoom(key, roomName) {
    const player = this.players.find(p => p.key === key)
    const room = this.rooms.find(room => room.roomName === roomName)
    room.players.push(player)
    this.sendBroadcastRooms()
  }

  sendAlertTo(key, title, text, alertType) {
    const player = this.players.find(p => p.key === key)
    player.connection.sendUTF(JSON.stringify({ type: 'alert', title, text, alertType }))
  }
}

const game = new GameApp()

wsServer.on('request', request => {

  const connection = request.accept(null, request.origin)

  game.addPlayer(new Player(request.key, connection, undefined))

  connection.on('message', message => {
    const command = JSON.parse(message.utf8Data)
    if (command.type === 'set_user_name') {
      return game.setUserName(request.key, command.userName)
    }
    if (command.type === 'create_room') {
      return game.createRoom(request.key, command.roomName)
    }
    if (command.type === 'leave_room') {
      return game.leaveRoom(request.key, command.roomName)
    }
    if (command.type === 'enter_room') {
      return game.enterRoom(request.key, command.roomName)
    }
  })

  connection.on('close', (reasonCode, description) => {
    game.removePlayer(request.key)
  })

  connection.on('error', error => {
    // TODO
  })
})