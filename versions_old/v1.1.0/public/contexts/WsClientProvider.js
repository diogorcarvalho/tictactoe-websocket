const WsClinetContext = React.createContext(null)

const GameState = {
  'InSetupUserName': 1,
  'SelectOrEnterRoom' : 2,
  'InsideTheRoom': 3
}

function WsClientProvider({ children }) {

  const uiContext = React.useContext(UIContext)

  const [wsClient, setWsClient] = React.useState()

  const [gameState, setGameState] = React.useState(GameState.InSetupUserName)

  const [userName, setUserName] = React.useState()

  const [roomName, setRoomName] = React.useState()

  const [players, setPlayers] = React.useState([])

  const [rooms, setRooms] = React.useState([])

  React.useEffect(() => {
    const wsClient = new WebSocket('ws://localhost:9898/')
    wsClient.onopen = () => console.log(`WebSocket Client Connected`)
    wsClient.onmessage = (event) => {
      const response = JSON.parse(event.data)
  
      if (response.type === 'players') {
        setPlayers(response.players)
      }
      
      if (response.type === 'rooms') {
        setRooms(response.rooms)
      }

      if (response.type === 'alert') {
        uiContext.openAlert({ title: response.title, text: response.text, alertType: response.alertType})
      }

      if (response.type === 'set_user_name') {
        setUserName(response.userName)
        setGameState(GameState.SelectOrEnterRoom)
      }

      if (response.type === 'create_room') {
        setRoomName(response.roomName)
        setGameState(GameState.InsideTheRoom)
      }
    }
    wsClient.onclose = (event) => console.log(`wsClient.onclose`)
    wsClient.onerror = (event) => console.log(`wsClient.onerror`)
    setWsClient(wsClient)
  }, [])

  function handleSetUserName(_userName) {
    _userName = _userName.trim()
    if (!_userName) return uiContext.openAlert({ title: 'Atenção', text: 'Preencha o campo'})
    wsClient.send(JSON.stringify({ type: 'set_user_name', userName: _userName })) 
  }

  function createRoom(_roomName) {
    _roomName = _roomName.trim()
    if (!_roomName) return uiContext.openAlert({ title: 'Atenção', text: 'Preencha o campo'})
    wsClient.send(JSON.stringify({ type: 'create_room', roomName: _roomName }))
  }

  function enterRoom(_roomName) {
    setRoomName(_roomName)
    setGameState(GameState.InsideTheRoom)
    wsClient.send(JSON.stringify({ type: 'enter_room', roomName: _roomName }))
  }

  function leaveRoom() {
    setRoomName()
    setGameState(GameState.SelectOrEnterRoom)
    wsClient.send(JSON.stringify({ type: 'leave_room', roomName }))
  }

  return (
    <WsClinetContext.Provider value={{      
      handleSetUserName,
      createRoom,
      enterRoom,
      leaveRoom,
      wsClient,
      gameState,
      userName,
      roomName,
      players,
      rooms
    }}>
      { children }
    </WsClinetContext.Provider>
  )  
}
