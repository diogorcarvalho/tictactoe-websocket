function InfoPlayer(props) {
  return (
    <WsClinetContext.Consumer>
      {({userName, roomName}) => (
        <div className="border">
          <Title text="Informações do jogador?" />
          <div className="list-item">Nome: {userName}</div>
          <div className="list-item">Sala: {roomName}</div>
        </div>
      )}
    </WsClinetContext.Consumer>
  )  
}