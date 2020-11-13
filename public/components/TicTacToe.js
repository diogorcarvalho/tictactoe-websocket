
const style = {
  i0_3: {"borderBottom": "2px solid white", "borderRight": "2px solid white"},
  i1_4: {"borderBottom": "2px solid white"},
  i2_5: {"borderBottom": "2px solid white", "borderLeft": "2px solid white"},
  i6: {"borderRight": "2px solid white"},
  i8: {"borderLeft": "2px solid white"}
}

function TicTacToe(props) {

  const {websocket} = React.useContext(WsContext)

  const [room, setRoom] = React.useState()

  const [table, setTable] = React.useState([ null, null, null, null, null, null, null, null, null ])

  React.useEffect(() => {

    function message(event) {
      const response = JSON.parse(event.data)
      if (response.command === 'context_game_update') {
        console.log(response.context)
        setRoom(response.context.room)
        setTable(response.context.room.table)
      }
    }

    websocket.addEventListener('message', message)

    return () => websocket.removeEventListener('message', message)
  }, [])

  function print(value) {
    return value !== null ? (value === 0 ? 'O' : 'X') : ''
  }

  function mark(index) {
    websocket.send(JSON.stringify({ command: 'mark', index })) 
  }

  if (!room) return <i className="title">carregando...</i>

  if (room.players.length === 1) {
    return (
      <div className="border">
        <div className="title">Aguardo a entrado do outro jogador</div>
      </div>
    )
  }

  function printPlayerName(num) {
    const _player = room.players[num]
    const score = _player.playerSymbol === 0 ? room.scores.playerOne : room.scores.playerTwo
    return _player.playerKey === room.playerTurn ? <b> ({score}) {_player.playerName} </b> : <span> ({score}) {_player.playerName} </span>
  }

  return (
    <div className="border">
      <div className="tablebar">{printPlayerName(0)} vs {printPlayerName(1)}</div>
      <div className="table">
        <div className="row">
          <div onClick={() => mark(0)} style={style.i0_3}>{print(table[0])}</div>
          <div onClick={() => mark(1)} style={style.i1_4}>{print(table[1])}</div>
          <div onClick={() => mark(2)} style={style.i2_5}>{print(table[2])}</div>
        </div>
        <div className="row">
          <div onClick={() => mark(3)} style={style.i0_3}>{print(table[3])}</div>
          <div onClick={() => mark(4)} style={style.i1_4}>{print(table[4])}</div>
          <div onClick={() => mark(5)} style={style.i2_5}>{print(table[5])}</div>
        </div>
        <div className="row">
          <div onClick={() => mark(6)} style={style.i6}>{print(table[6])}</div>
          <div onClick={() => mark(7)}>{print(table[7])}</div>
          <div onClick={() => mark(8)} style={style.i8}>{print(table[8])}</div>
        </div>
      </div>
    </div>
  )  
}