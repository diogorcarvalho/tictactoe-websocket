function CreateRoom(props) {

  const wsContext = React.useContext(WsContext)

  const [roomName, setRoomName] = React.useState()

  return (
    <div className="border">
      <Title text="Criar sala" />
      <input type="text" value={roomName} onChange={ev => setRoomName(ev.target.value)} />
      <button onClick={() => wsContext.createRoom(roomName)}>Criar</button>
    </div>
  )
}