const WsContext = React.createContext(null)

const PlayerState = {
  'InSetupPlayerName': 1,
  'CreateOrEnterRoom' : 2,
  'InsideRoom': 3
}

function WsProvider({ children }) {

  const uiContext = React.useContext(UIContext)

  const [websocket, setWebsocket] = React.useState()

  const [context, setContext] = React.useState()

  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:9898/')
    
    ws.onopen = () => console.log('Websocket Client Connected')
    
    ws.onmessage = (event) => {
    
      const response = JSON.parse(event.data)

      if (response.command === 'context_update') {
        setContext(response.context)
      }

      if (response.command === 'alert') {
        uiContext.openAlert({ title: response.title, text: response.text, alertType: response.alertType})
      }
    }
    
    ws.onclose = (event) => console.log(`wsClient.onclose`)
    
    ws.onerror = (event) => console.log(`wsClient.onerror`)
    
    setWebsocket(ws)
  }, [])

  function setPlayerName(playerName) {
    
    playerName = playerName.trim()
    
    if (!playerName) return uiContext.openAlert({ title: 'Atenção', text: 'Preencha o campo'})
    
    websocket.send(JSON.stringify({ command: 'set_player_name', playerName })) 
  }

  function createRoom(roomName) {
    
    roomName = roomName.trim()

    if (!roomName) return uiContext.openAlert({ title: 'Atenção', text: 'Preencha o campo'})

    websocket.send(JSON.stringify({ command: 'create_room', roomName }))
  }

  function enterRoom(roomName) {
    
    roomName = roomName.trim()

    if (!roomName) return uiContext.openAlert({ title: 'Atenção', text: 'Preencha o campo'})

    websocket.send(JSON.stringify({ command: 'enter_room', roomName }))
  }

  function leaveRoom() {
    websocket.send(JSON.stringify({ command: 'leave_room' })) 
  }

  return (
    <WsContext.Provider value={{
      websocket,
      context,
      enterRoom,
      leaveRoom,
      setPlayerName,
      createRoom
    }}>
      { children }
    </WsContext.Provider>
  )  
}
