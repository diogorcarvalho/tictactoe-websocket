let wsClient = new WebSocket('ws://localhost:9898/')

let player = undefined
let userName = undefined
let gameContext = undefined

wsClient.onopen = () => {
    console.log('WebSocket Client Connected')
}

wsClient.onmessage = (event) => {

    const response = JSON.parse(event.data)

    if (response.type === 'set_username') {
        console.log(`wsClient.onmessage - set_username`)
        return
    }

    if (response.type === 'victoryMessage') {
        alert(response.text)
        return
    }

    if (response.type === 'defeatMessage') {
        alert(response.text)
        return
    }

    if (response.type === 'messageError') {
        alert(response.text)
        return
    }

    if (response.type === 'context') {
        console.log(`wsClient.onmessage - context`, response.context)
        gameContext = response.context

        player = response.context.playOne?.userName === userName ? 0 : 1

        if (gameContext.readyToStart) {
            document.querySelector('#usernamebox').setAttribute('hidden', true)
            document.querySelector('#table').removeAttribute('hidden')

            const tablebar = document.querySelector('#tablebar')
            tablebar.innerHTML = ''

            const scorePlayerOne = document.createElement('span')
            scorePlayerOne.innerHTML = `(${gameContext.playOne.score}) `
            tablebar.append(scorePlayerOne)

            const _playOne_ = gameContext.playOne.player === player ? document.createElement('strong') : document.createElement('span')
            _playOne_.innerHTML = gameContext.playOne.userName
            _playOne_.style.color = gameContext.currentPlayer === gameContext.playOne.player ? 'yellow' : 'white'
            tablebar.append(_playOne_)

            const _vs_ = document.createElement('span')
            _vs_.innerHTML = ' vs '
            tablebar.append(_vs_)

            const _playTow_ = gameContext.playTow.player === player ? document.createElement('strong') : document.createElement('span')
            _playTow_.innerHTML = gameContext.playTow.userName
            _playTow_.style.color = gameContext.currentPlayer === gameContext.playTow.player ? 'yellow' : 'white'
            tablebar.append(_playTow_)

            const scorePlayerTow = document.createElement('span')
            scorePlayerTow.innerHTML = ` (${gameContext.playTow.score})`
            tablebar.append(scorePlayerTow)

        } else {
            document.querySelector('#usernamebox').removeAttribute('hidden')
            document.querySelector('#table').setAttribute('hidden', true)
        }
        for (let i = 0; i < gameContext.table.length; i++) {
            if (gameContext.table[i] != undefined) {
                document.querySelector(`#index-${i}`).innerHTML = gameContext.table[i] === 0 ? 'O' : 'X'
            } else {
                document.querySelector(`#index-${i}`).innerHTML = ''
            }
        }
        return
    }
}

wsClient.onclose = (event) => {
    console.log(`wsClient.onclose`)
    reset()
}

wsClient.onerror = (event) => {
    console.log(`wsClient.onerror`)
    reset()
}

function setUserName() {
    const input = document.querySelector("#username")
    userName = input.value.trim()
    if (!userName) {
        alert('Preencha o campo')
        return
    }
    wsClient.send(JSON.stringify({ type: 'set_user_name', userName: userName }))
}

function mark(index) {
    if (gameContext.currentPlayer !== player) return
    if (gameContext == undefined && gameContext.table[index] != undefined) return
    wsClient.send(JSON.stringify({ type: 'mark', index }))
}

function reset() {
    gameContext = undefined
    player = undefined
    userName = undefined
    for (let i = 0; i < 9; i++) {
        document.querySelector(`#index-${i}`).innerHTML = ''
    }
    document.querySelector('#usernamebox').removeAttribute('hidden')
    document.querySelector('#table').setAttribute('hidden', true)
}