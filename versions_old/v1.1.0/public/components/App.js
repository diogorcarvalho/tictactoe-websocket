
function App(props) {
  return (
    <UIProvider>
      <WsClientProvider>
        <WsClinetContext.Consumer>
          {({gameState, leaveRoom}) => (
            <>
              <Alert />
              <TicTacToe />
              <Title text={props.title} />
              <InfoPlayer />
              {GameState.InSetupUserName === gameState ? <UserName /> : ''}
              {GameState.SelectOrEnterRoom === gameState ? <Players /> : ''}
              {GameState.SelectOrEnterRoom === gameState ? <CreateRoom /> : ''}
              {GameState.SelectOrEnterRoom === gameState ? <Rooms /> : ''}
              {GameState.InsideTheRoom === gameState ? <button onClick={() => leaveRoom()}>Sair da sala</button> : ''}
              {GameState.InsideTheRoom === gameState ? <GamePlace /> : ''}
            </>
          )}
        </WsClinetContext.Consumer>
      </WsClientProvider>
    </UIProvider>
  )
}