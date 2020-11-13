function GamePlace(props) {
  return (
    <WsContext.Consumer>
      {({context}) => {
        const _room = context.rooms.find(room => room.players.find(player => player.playerKey === context.player.playerKey))
        return (
          <>
            <div className="border">
              <Title text="Game place" />
              <div>{_room.roomName}</div>
              {_room.players.map(player => <div key={player.playerKey}>{player.playerName}</div>)}
              <TicTacToe />              
            </div>
          </>
        )
      }}
    </WsContext.Consumer>
  )  
}