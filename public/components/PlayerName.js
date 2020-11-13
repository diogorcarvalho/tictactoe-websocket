function PlayerName(props) {

  const wsContext = React.useContext(WsContext)

  const [playerName, setPlayerName] = React.useState()

  return (
    <div className="border">
      <Title text="Qual o seu nome?" />
      <input type="text" value={playerName} onChange={ev => setPlayerName(ev.target.value)} />
      <button onClick={() => wsContext.setPlayerName(playerName)}>Enviar</button>
    </div>
  )  
}