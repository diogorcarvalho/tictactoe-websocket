function Room({data}) {
  return (
    <WsClinetContext.Consumer>
      {({enterRoom, leaveRoom, userName}) => (
        <div className="list-item">
          RoomName: {data.roomName} - Players: {data.players.length}
          {!!data.players.find(p => p.userName === userName)
            ? <button onClick={() => leaveRoom(data.roomName)}>Sair</button>
            : <button onClick={() => enterRoom(data.roomName)}>Entrar</button>}
        </div>
      )}
    </WsClinetContext.Consumer>
  )  
}

function Rooms(props) {
  return (
    <WsClinetContext.Consumer>
      {({rooms}) => (
        <div className="border">
          <Title text="Salas" />
          {rooms.map(r => <Room key={r.roomName} data={r} />)}
        </div>
      )}
    </WsClinetContext.Consumer>
  )
}