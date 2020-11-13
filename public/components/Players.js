function Player({data}) {
  return (
    <div className="list-item">Key: {data.key} - UserName: {data.userName || 'n/d'}</div>
  )  
}

function Players(props) {
  return (
    <WsClinetContext.Consumer>
      {({players}) => (
        <div className="border">
          <Title text="Jogadores" />
          {players.map(p => <Player key={p.key} data={p} />)}
        </div>
      )}
    </WsClinetContext.Consumer>
  )  
}

// function Players(props) {

//   const context = React.useContext(WsClinetContext)

//   return (
//     <div className="border">
//       <Title text="Jogadores" />
//       {context.players.map(p => <div key={p.key}>{p.key} - {p.userName}</div>)}
//     </div>
//   )  
// }