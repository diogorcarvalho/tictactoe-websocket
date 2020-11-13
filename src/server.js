const fs = require('fs')
const http = require('http')
const WebSocketServer = require('websocket').server
const port = 9898

const server = http.createServer((req, resp) => {
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
      ...this,
      connection: undefined
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
      ...this,
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
    const _room = this.rooms.find(room => room.roomName === roomName)
    
    const _player = this.players.find(player => player.playerKey === playerKey)
    
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
      player.connection.sendUTF(JSON.stringify({ command: 'context_update', context: _ctx }))
    })
  }

  sendAlertTo(playerKey, title, text, alertType) {
    
    const _player = this.players.find(player => player.playerKey === playerKey)
    
    _player.connection.sendUTF(JSON.stringify({ command: 'alert', title, text, alertType }))
  }
}

const RoomState = {
  'AwaitingPlayerTwo': 1,
  'GameStarted': 2
}

class TicTacToe extends GameApp {
  constructor () {
    super()
  }

  createRoom(playerKey, roomName) {
    roomName = roomName.trim()
    
    const _existingRoom = this.rooms.find(room => room.roomName === roomName)
    
    if (!!_existingRoom) return this.sendAlertTo(playerKey, 'Atenção', `Já há uma sala com o nome: "${roomName}"`, 'error')
    
    const _player = this.players.find(player => player.playerKey === playerKey)

    _player.playerSymbol = 0
    
    const _room = new Room(_player, roomName)

    _room.table = [ null, null, null, null, null, null, null, null, null ]

    _room.roomState = RoomState.AwaitingPlayerTwo

    _room.playerTurn = playerKey

    _room.scores = {
      playerOne: 0,
      playerTwo: 0
    }

    this.rooms.push(_room)

    _player.playerState = PlayerState.InsideRoom
    
    this.contextUpdate()
    this.contextGameUpdate()
  }

  enterRoom(playerKey, roomName) {
    const _room = this.rooms.find(room => room.roomName === roomName)

    if (_room.players.length >= 2) {
      return this.sendAlertTo(playerKey, 'Atenção', `Não é permitido mais que dois jogadores`, 'error')
    }
    
    const _playerTwo = this.players.find(player => player.playerKey === playerKey)

    _playerTwo.playerSymbol = _room.players[0].playerSymbol === 0 ? 1 : 0
    
    _room.players.push(_playerTwo)

    _room.roomState = RoomState.GameStarted

    _room.playerTurn = _room.players[0].playerKey
    
    _playerTwo.playerState = PlayerState.InsideRoom
    
    this.contextUpdate()
    this.contextGameUpdate()
  }

  leaveRoom(playerKey) {

    const _room = this.rooms.find(room => !!room.players.find(player => player.playerKey === playerKey))

    _room.players = _room.players.filter(player => player.playerKey !== playerKey)

    if (_room.players.length == 1) {

      _room.table = [ null, null, null, null, null, null, null, null, null ]
    
      _room.roomState = RoomState.AwaitingPlayerTwo

      _room.playerTurn = _room.players[0].playerKey

      _room.scores = {
        playerOne: 0,
        playerTwo: 0
      }

      this.sendAlertTo(_room.players[0].playerKey, 'Vitório', `Seu oponente ARREGOU!`, 'success')
      this.sendAlertTo(playerKey, 'Derrota', `Você é um ARREGÃO! kk`, 'success')
    
    } else { // _room.players.length == 0
    
      this.rooms = this.rooms.filter(room => room.roomName !== _room.roomName)
    }

    const _player = this.players.find(player => player.playerKey === playerKey)

    _player.playerState = PlayerState.CreateOrEnterRoom

    this.contextUpdate()
    this.contextGameUpdate()
  }

  check(player, table) {
    if (table[0] === player && table[1] === player && table[2] === player) return true
    if (table[3] === player && table[4] === player && table[5] === player) return true
    if (table[6] === player && table[7] === player && table[8] === player) return true
    if (table[0] === player && table[3] === player && table[6] === player) return true
    if (table[1] === player && table[4] === player && table[7] === player) return true
    if (table[2] === player && table[5] === player && table[8] === player) return true
    if (table[0] === player && table[4] === player && table[8] === player) return true
    if (table[6] === player && table[4] === player && table[2] === player) return true
    return false
  }

  isTableFull(table) {
    if (table[0] != null && table[1] != null && table[2] != null
      && table[3] != null && table[4] != null && table[5] != null
      && table[6] != null && table[7] != null && table[8] != null) return true
    return false
  }

  mark(playerKey, index) {
    const _room = this.rooms.filter(room => !!room.players.find(player => player.playerKey === playerKey))[0]

    if (_room.table[index] != null) return

    if (_room.roomState !== RoomState.GameStarted)
      return this.sendAlertTo(playerKey, 'Atenção', `O jogo ainda não começou`, 'error')

    if (_room.playerTurn !== playerKey)
      return this.sendAlertTo(playerKey, 'Atenção', `Aguarde sua vez de joga`, 'error')

    const _currentPlayer = _room.players.find(player => player.playerKey === playerKey)
    
    const _otherPlayer = _room.players.find(player => player.playerKey !== playerKey)
    
    _room.table[index] = _currentPlayer.playerSymbol

    if (this.check(_currentPlayer.playerSymbol, _room.table)) {
      this.sendAlertTo(_currentPlayer.playerKey, 'Sucesso', `Você venceu, parabéns!`, 'success')
      this.sendAlertTo(_otherPlayer.playerKey, 'Derrota', `Burro! você perdeu...`, 'success')
      _room.table = [ null, null, null, null, null, null, null, null, null ]
      _room.playerTurn = playerKey
      
      if (_currentPlayer.playerSymbol === 0) {
        _room.scores.playerOne++
      } else {
        _room.scores.playerTwo++
      }

      this.contextGameUpdate()
      return
    }

    if (this.isTableFull(_room.table)) {
      this.sendAlertTo(_currentPlayer.playerKey, 'Aviso', `Ninguém ganhou, joguem outra vez.`, 'success')
      this.sendAlertTo(_otherPlayer.playerKey, 'Aviso', `Ninguém ganhou, joguem outra vez.`, 'success')
      _room.table = [ null, null, null, null, null, null, null, null, null ]
      _room.playerTurn = playerKey
      this.contextGameUpdate()
      return
    }

    _room.playerTurn = _otherPlayer.playerKey
    
    this.contextGameUpdate()
  }

  contextGameUpdate() {
    this.rooms.forEach(room => {
      room.players.forEach(player => {
        player.connection.sendUTF(JSON.stringify({ command: 'context_game_update', context: { room: room.map(), player: player.map() } }))
      })
    })
  }
  
  removePlayer(playerKey) {
    // Obtem o room onde o jogador se encontra.
    const _room = this.rooms.find(room => !!room.players.find(player => player.playerKey === playerKey))

    // Remove o jogador da sala
    _room.players = _room.players.filter(player => player.playerKey !== playerKey)

    if (_room.players.length == 1) {

      _room.table = [ null, null, null, null, null, null, null, null, null ]
    
      _room.roomState = RoomState.AwaitingPlayerTwo

      _room.playerTurn = _room.players[0].playerKey

      _room.scores = {
        playerOne: 0,
        playerTwo: 0
      }

      this.contextGameUpdate()

      this.sendAlertTo(_room.players[0].playerKey, 'Vitório', `Seu oponente ARREGOU!`, 'success')

      return 
    }

    // Remove as salas que está vazias.
    this.rooms = this.rooms.filter(room => room.roomName !== _room.roomName)

    // Remove o jogador da lista de jogadores.
    this.players = this.players.filter(player => player.playerKey !== playerKey)

    this.contextUpdate()
  }
}

const game = new TicTacToe()

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

    // ##### TicTacToe funcs ##### //

    if (payload.command === 'mark') {
      return game.mark(request.key, payload.index)
    }
  })

  connection.on('close', (reasonCode, description) => {
    game.removePlayer(request.key)
  })

  connection.on('error', error => {
    // TODO
  })
})