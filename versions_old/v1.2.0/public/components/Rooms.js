function Room({room, player}) {
  return (
    <WsContext.Consumer>
      {({enterRoom, leaveRoom}) => (
        <div className="list-item">
          <b>{room.roomName}</b> com <b>{room.players.length}</b> {room.players.length > 1 ? 'jogadores' : 'jogador'}
          {
            !!room.players.find(_player => _player.playerName === player.playerName)
            ? <button onClick={() => leaveRoom(room.roomName)}>Sair</button>
            : <button onClick={() => enterRoom(room.roomName)}>Entrar</button>
          }    
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
            {context?.rooms.map(room => <Room key={room.roomName} room={room} player={context.player} />)}
          </div>
        )
      }}
    </WsContext.Consumer>
  )
}