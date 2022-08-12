import { Fragment, useState, useEffect } from 'react';

const initialBoard = new Array(15 * 15).fill(0); // empty is 0, black is -1, white is 1
const specialSpaces = new Set([48, 56, 112, 168, 176]);

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [history, setHistory] = useState([]);
  const [winner, setWinner] = useState(0);
  const [theFive, setTheFive] = useState([]);

  useEffect(() => {
    const blacks = new Set(),
      whites = new Set();

    history.forEach((pos, step) => {
      if (step % 2 === 0) {
        blacks.add(pos);
      } else {
        whites.add(pos);
      }
    });

    // helper to check the winning condition
    const checkWinning = option => {
      const directions = [1, 14, 15, 16];
      const pieces = option === -1 ? blacks : whites;

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

    checkWinning(-1); // check for the black player
    checkWinning(1); // check for the white player
  }, [history]);

  const moveHandler = pos => () => {
    if (!history.includes(pos) && !winner) {
      setBoard(prev =>
        prev.map((curr_piece, curr_pos) =>
          curr_pos === pos && !curr_piece ? turn() : curr_piece
        )
      );

      setHistory(prev => [...prev, pos]);
    }
  };

  const backHandler = () => {
    const backPos = history.at(-1);
    setBoard(prev => prev.map((piece, pos) => (pos === backPos ? 0 : piece)));
    setHistory(prev => prev.filter(pos => pos !== backPos));
    setWinner(0);
    setTheFive([]);
  };

  const restartHandler = () => {
    setBoard(initialBoard);
    setHistory([]);
    setWinner(0);
    setTheFive([]);
  };

  // return -1 if it's black's turn, else 1
  const turn = () => (history.length % 2 === 0 ? -1 : 1);

  return (
    <Fragment>
      <div className={`board ${winner && 'game-over-board'}`}>
        {board.map((piece, pos) => (
          <div
            key={pos}
            className={`space ${piece && (piece === -1 ? 'black' : 'white')} ${
              !piece && specialSpaces.has(pos) && 'special-space'
            } ${theFive.includes(pos) && 'winning-pieces'} ${
              !piece &&
              !winner &&
              (turn() === -1 ? 'black-hover' : 'white-hover')
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
            !winner
              ? turn() === -1
                ? 'black-signifier'
                : 'white-signifier'
              : turn() === 1
              ? 'black-signifier'
              : 'white-signifier'
          } ${winner && 'game-over-signifier'}`}
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
// refactor the code - readability, reusability
// support mobile devices
// make the pieces look nicers
// find a nice board
// add sound effect
// add a countdown timer
// able to replay
// able to save a game and resume later on
// allow two players to play remotely
// add AI
