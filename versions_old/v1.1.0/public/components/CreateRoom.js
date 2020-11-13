function CreateRoom(props) {

  const context = React.useContext(WsClinetContext)

  const [roomName, setRoomName] = React.useState()

  return (
    <div className="border">
      <Title text="Criar sala" />
      <input type="text" value={roomName} onChange={ev => setRoomName(ev.target.value)} />
      <button onClick={() => context.createRoom(roomName)}>Criar</button>
    </div>
  )
}