function GamePlace(props) {
  return (
    <WsClinetContext.Consumer>
      {({rooms, roomName}) => (
        <>
          <div className="border">
            <Title text="Game place" />
            {rooms.find(room => room.roomName === roomName)?.players.map(p => <div className="list-item">{p.userName}</div>)}
          </div>
        </>
      )}
    </WsClinetContext.Consumer>
  )  
}