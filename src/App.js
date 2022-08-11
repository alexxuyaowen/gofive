import { Fragment, useState, useEffect } from 'react';

const classes = { '-1': 'unfilled', 0: 'black', 1: 'white' };
const specialSpaces = new Set([48, 56, 112, 168, 176]);
const initialBoard = new Array(15 * 15).fill(-1);

function App() {
  // unfilled is -1, black is 0, white is 1
  const [board, setBoard] = useState(initialBoard);
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(-1);
  const [theFive, setTheFive] = useState([]);

  useEffect(() => {
    const blacks = new Set(),
      whites = new Set();

    history.forEach((e, i) => {
      if (i % 2 === 0) {
        blacks.add(e);
      } else {
        whites.add(e);
      }
    });

    // helper to check the winning condition
    const checkWinning = option => {
      const directions = [1, 14, 15, 16];
      const pieces = option === 0 ? blacks : whites;

      // helper to check each direction
      const checkOneDirection = (pos, dir) => {
        for (let i = 0; i < 5; i++) {
          if (!pieces.has(pos + i * dir)) {
            return false;
          }
        }

        setTheFive([
          pos,
          pos + dir,
          pos + dir * 2,
          pos + dir * 3,
          pos + dir * 4,
        ]);

        return true;
      };

      for (const pos of pieces) {
        directions.forEach(dir => {
          if (checkOneDirection(pos, dir)) {
            setWinner(option);
            return;
          }
        });
      }
    };

    checkWinning(0); // check for the black player
    checkWinning(1); // check for the white player
  }, [history]);

  const moveHandler = i => () => {
    if (!history.includes(i) && winner === -1) {
      setBoard(prev =>
        prev.map((curr, curr_i) => {
          if (curr_i === i && curr === -1) {
            return turn();
          }

          return curr;
        })
      );

      setHistory(prev => [...prev, i]);
    }
  };

  const backHandler = () => {
    const backPos = history.at(-1);
    setBoard(prev => prev.map((e, i) => (i === backPos ? -1 : e)));
    setHistory(prev => prev.filter(e => e !== backPos));
    setWinner(-1);
    setTheFive([]);
  };

  const restartHandler = () => {
    setBoard(initialBoard);
    setHistory([]);
    setWinner(-1);
    setTheFive([]);
  };

  // return 0 if it's black's turn, else 1
  const turn = () => history.length % 2;

  return (
    <Fragment>
      <div className='board'>
        {board.map((e, i) => (
          <div
            key={i}
            className={`space ${classes[e]} ${
              specialSpaces.has(i) && 'special-space'
            } ${theFive.includes(i) && 'winning-pieces'} ${
              e === -1 &&
              winner === -1 &&
              (turn() === 0 ? 'black-hover' : 'white-hover')
            }`}
            onClick={moveHandler(i)}
          />
        ))}
      </div>

      <div className='toolkit'>
        <button onClick={backHandler} disabled={history.length === 0}>
          <span id='back-symbol'>⇦</span>
        </button>

        <div
          className={`${
            winner === -1
              ? turn() === 0
                ? 'black-signifier'
                : 'white-signifier'
              : turn() === 1
              ? 'black-signifier'
              : 'white-signifier'
          } ${winner !== -1 && 'game-over'}`}
        />

        <button onClick={restartHandler} disabled={history.length === 0}>
          <span id='restart-symbol'>⟲</span>
        </button>
      </div>
    </Fragment>
  );
}

export default App;
