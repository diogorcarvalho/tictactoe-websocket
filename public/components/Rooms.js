function Room({room}) {
  return (
    <WsContext.Consumer>
      {({enterRoom, leaveRoom}) => (
        <div className="list-item">
          <b>{room.roomName}</b> com <b>{room.players.length}</b> {room.players.length > 1 ? 'jogadores ' : 'jogador '}
          {room.players.length < 2 ? <button onClick={() => enterRoom(room.roomName)}>Entrar</button> : <i> - patida inicia</i>}
        </div>
      )}
    </WsContext.Consumer>
  )
}

function Rooms(props) {
  return (
    <WsContext.Consumer>
      {({context}) => {
        return (
          <div className="border">
            <Title text="Salas" />
            {context?.rooms.map(room => <Room key={room.roomName} room={room} />)}
          </div>
        )
      }}
    </WsContext.Consumer>
  )
}