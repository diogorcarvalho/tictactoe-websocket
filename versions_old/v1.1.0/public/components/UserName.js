function UserName(props) {

  const context = React.useContext(WsClinetContext)

  const [userName, setUserName] = React.useState()

  return (
    <div className="border">
      <Title text="Qual o seu nome?" />
      <input type="text" value={userName} onChange={ev => setUserName(ev.target.value)} />
      <button onClick={() => context.handleSetUserName(userName)}>Enviar</button>
    </div>
  )  
}