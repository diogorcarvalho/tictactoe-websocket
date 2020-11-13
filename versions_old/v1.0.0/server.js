const fs = require('fs')
const http = require('http')
const WebSocketServer = require('websocket').server

const server = http.createServer((req, resp) => {
    fs.readFile(`${__dirname}${req.url}`, (error, data) => {
        if (error) {
            resp.writeHead(404).end(JSON.stringify(error))
            return
        }
        resp.writeHead(200).end(data)
    })
}).listen(9898)

const wsServer = new WebSocketServer({ httpServer: server })

let game = undefined

wsServer.on('request', (request) => {

    const connection = request.accept(null, request.origin)

    if (game === undefined) {
        game = new TicTacToe()
        game.playOne = new Player(0, 0, connection, request, undefined)
    } else {
        if (game.playOne == undefined) game.playOne = new Player(0, 0, connection, request, undefined)
        if (game.playTow == undefined) game.playTow = new Player(1, 0, connection, request, undefined)
    }

    game.sendContext()

    connection.on('message', (message) => {
        const command = JSON.parse(message.utf8Data)
        if (command.type === 'set_user_name') {
            console.log(request.key)
            game.setUserName(command.userName, request.key)
        }
        if (command.type === 'mark') {
            game.mark(command.index, request.key)
        }
    })

    connection.on('close', (reasonCode, description) => {
        console.log(`connection.on('close', ()=>) - key: ${request.key}`)
        game.closeConnection(request.key)
        if (game.playOne == undefined && game.playTow == undefined) game = undefined
    })
})

class Player {
    constructor(player, score, connection, request, userName) {
        this.player = player
        this.score = score
        this.connection = connection
        this.request = request
        this.key = request.key
        this.userName = userName
    }
}

class TicTacToe {
    constructor() {
        this.table = [
            undefined, undefined, undefined,
            undefined, undefined, undefined,
            undefined, undefined, undefined,
        ]
        this.eadyToStart = false
        this.playOne = undefined
        this.playTow = undefined
        this.currentPlayer = 0
    }

    mark(index, key) {
        console.log(`game.mark(index: ${index}, key: ${key})`)

        const player = this.getPlayerByKey(key)

        if (this.table[index] != undefined) return

        this.table[index] = player.player

        this.currentPlayer = player.player === 0 ? 1 : 0

        this.sendContext()

        if (this.check(player.player)) {
            player.connection.sendUTF(JSON.stringify({ type: 'victoryMessage', text: 'Você venceu, parabéns!' }))
            player.score++

            if (player.player === 0) {
                this.playTow.connection.sendUTF(JSON.stringify({ type: 'defeatMessage', text: 'Você perdeu, burro!' }))
            } else {
                this.playOne.connection.sendUTF(JSON.stringify({ type: 'defeatMessage', text: 'Você perdeu, burro!' }))
            }

            this.resetTable()
            this.currentPlayer = 0
            this.sendContext()
        }
    }

    check(player) {
        console.log(`game.check(player: ${player})`)
        if (this.table[0] === player && this.table[1] === player && this.table[2] === player) return true
        if (this.table[3] === player && this.table[4] === player && this.table[5] === player) return true
        if (this.table[6] === player && this.table[7] === player && this.table[8] === player) return true
        if (this.table[0] === player && this.table[3] === player && this.table[6] === player) return true
        if (this.table[1] === player && this.table[4] === player && this.table[7] === player) return true
        if (this.table[2] === player && this.table[5] === player && this.table[8] === player) return true
        if (this.table[0] === player && this.table[4] === player && this.table[8] === player) return true
        if (this.table[6] === player && this.table[4] === player && this.table[2] === player) return true
        return false
    }

    getContext() {
        console.log(`game.getContext()`)
        return {
            table: this.table,
            playOne: !!this.playOne ? { player: 0, userName: this.playOne.userName, score: this.playOne.score } : undefined,
            playTow: !!this.playTow ? { player: 1, userName: this.playTow.userName, score: this.playTow.score } : undefined,
            currentPlayer: this.currentPlayer,
            readyToStart: this.readyToStart
        }
    }

    sendContext() {
        console.log(`game.sendContext() ${!!this.playOne ? 'playOne' : ''} ${!!this.playTow ? 'playTow' : ''}`)
        const response = { type: 'context', context: this.getContext() }
        if (!!this.playOne) {
            this.playOne.connection.sendUTF(JSON.stringify(response))
        }
        if (!!this.playTow) {
            this.playTow.connection.sendUTF(JSON.stringify(response))
        }
    }

    resetTable() {
        console.log(`game.resetTable()`)
        this.table = [
            undefined, undefined, undefined,
            undefined, undefined, undefined,
            undefined, undefined, undefined,
        ]
    }

    setUserName(userName, key) {
        console.log(`game.setUserName(userName: ${userName}, key: ${key})`)

        const playerAlreadyExists = this.getPlayerByUserName(userName)
        if (!!playerAlreadyExists) {
            const player = this.getPlayerByKey(key)
            const response = { type: 'messageError', text: 'Este nome já está sendo usando...' }
            player.connection.sendUTF(JSON.stringify(response))
            return
        }

        const player = this.getPlayerByKey(key)
        player.userName = userName

        if (!!this.playOne?.userName && !!this.playTow?.userName) {
            this.readyToStart = true
        } else {
            this.readyToStart = false
        }

        this.sendContext()
    }

    closeConnection(key) {
        console.log(`game.closeConnection(key: ${key})`)

        this.readyToStart = false

        if (this.playOne?.key === key) {
            this.playOne = undefined
        }

        if (this.playTow?.key === key) {
            this.playTow = undefined
        }

        if (!!this.playOne || !!this.playTow) {
            this.resetTable()
            this.sendContext()
        }
    }

    getPlayerByUserName(userName) {
        console.log(`game.getPlayerByUserName(userName: ${userName})`)
        if (!!this.playOne && this.playOne.userName === userName) return this.playOne
        if (!!this.playTow && this.playTow.userName === userName) return this.playTow
        return null
    }

    getPlayerByKey(key) {
        console.log(`game.getPlayerByKey(key: ${key})`)
        if (!!this.playOne && this.playOne.key === key) return this.playOne
        if (!!this.playTow && this.playTow.key === key) return this.playTow
        return null
    }
}
