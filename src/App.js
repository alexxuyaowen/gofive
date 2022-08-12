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
          if (!pieces.has(pos + dir * i)) {
            return false;
          }
        }

        setTheFive([0, 1, 2, 3, 4].map(e => pos + dir * e));

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

  const moveHandler = pos => () => {
    if (!history.includes(pos) && winner === -1) {
      setBoard(prev =>
        prev.map((curr, curr_pos) => {
          if (curr_pos === pos && curr === -1) {
            return turn();
          }

          return curr;
        })
      );

      setHistory(prev => [...prev, pos]);
    }
  };

  const backHandler = () => {
    const backPos = history.at(-1);
    setBoard(prev => prev.map((piece, pos) => (pos === backPos ? -1 : piece)));
    setHistory(prev => prev.filter(pos => pos !== backPos));
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
      <div className={`board ${winner !== -1 && 'game-over-board'}`}>
        {board.map((piece, pos) => (
          <div
            key={pos}
            className={`space ${classes[piece]} ${
              specialSpaces.has(pos) && 'special-space'
            } ${theFive.includes(pos) && 'winning-pieces'} ${
              piece === -1 &&
              winner === -1 &&
              (turn() === 0 ? 'black-hover' : 'white-hover')
            }`}
            onClick={moveHandler(pos)}
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
          } ${winner !== -1 && 'game-over-signifier'}`}
        />

        <button onClick={restartHandler} disabled={history.length === 0}>
          <span id='restart-symbol'>⟲</span>
        </button>
      </div>
    </Fragment>
  );
}

export default App;

// To do:
// refactor the code
// make the pieces look nicers
// find a nice board
// add sound effect
// add a countdown timer
// able to replay
// able to save a game and resume later on
// allow two players to play remotely
// add AI
