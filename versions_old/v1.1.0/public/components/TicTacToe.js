
const style = {
  i0_3: {"borderBottom": "2px solid white", "borderRight": "2px solid white"},
  i1_4: {"borderBottom": "2px solid white"},
  i2_5: {"borderBottom": "2px solid white", "borderLeft": "2px solid white"},
  i6: {"borderRight": "2px solid white"},
  i8: {"borderLeft": "2px solid white"}
}

function TicTacToe(props) {

  const [table, setTable] = React.useState([
    0, undefined, 1,
    1, 0, undefined,
    1, undefined, 0
  ])

  function print(value) {
    return value !== undefined ? (value === 0 ? 'O' : 'X') : ''
  }

  function mark(index) {
    // TODO    
  }

  return (
    <div className="border">
      <div className="tablebar">...</div>
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