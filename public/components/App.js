
function App(props) {
  return (
    <UIProvider>
      <WsProvider>
        <WsContext.Consumer>
          {({context, leaveRoom}) => {
            if (!context) return <Title text={props.title} />
            return (
              <>
                <Alert />
                <Title text={props.title} />
                {context.player.playerState === PlayerState.InSetupPlayerName ? <PlayerName /> : ''}
                
                {context.player.playerState === PlayerState.CreateOrEnterRoom ? <CreateRoom /> : ''}
                {context.player.playerState === PlayerState.CreateOrEnterRoom ? <Rooms /> : ''}
                
                {context.player.playerState === PlayerState.InsideRoom ? <button className="btn" onClick={() => leaveRoom()}>Sair</button> : ''}
                {context.player.playerState === PlayerState.InsideRoom ? <GamePlace /> : ''}
              </>
            )
          }}
        </WsContext.Consumer>
      </WsProvider>
    </UIProvider>
  )
}