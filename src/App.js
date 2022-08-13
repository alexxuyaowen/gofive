import { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { boardActions } from './store/board';

// const initialBoard = new Array(15 * 15).fill(0); // empty is 0, black is -1, white is 1
const specialSpaces = new Set([48, 56, 112, 168, 176]);

function App() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.board.board);
  const history = useSelector(state => state.board.history);
  const turn = useSelector(state => state.board.turn);

  const [winner, setWinner] = useState(0);
  const [theFive, setTheFive] = useState([]);

  // check winning condition
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

    const checkWinning = pieces => {
      const directions = [1, 14, 15, 16];

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
        if (directions.some(dir => checkOneDirection(pos, dir))) {
          setWinner(turn);
          break;
        }
      }
    };

    checkWinning(blacks);
    checkWinning(whites);
  }, [history, turn]);

  const placeOnBoard = pos => () => {
    if (!winner) dispatch(boardActions.placeOnBoard(pos));
  };

  const goBack = () => {
    dispatch(boardActions.goBack());
    setWinner(0);
    setTheFive([]);
  };

  const restartHandler = () => {
    dispatch(boardActions.clearBoard());
    setWinner(0);
    setTheFive([]);
  };

  return (
    <Fragment>
      <div className={`board ${winner && 'game-over-board'}`}>
        {board.map((piece, pos) => (
          <div
            key={pos}
            className={`space ${piece && (piece === -1 ? 'black' : 'white')} ${
              !piece && specialSpaces.has(pos) && 'special-space'
            } ${theFive.includes(pos) && 'winning-pieces'} ${
              !piece && !winner && (turn === -1 ? 'black-hover' : 'white-hover')
            }`}
            onClick={placeOnBoard(pos)}
          />
        ))}
      </div>

      <div className='toolkit'>
        <button onClick={goBack} disabled={history.length === 0}>
          <span id='back-symbol'>⇦</span>
        </button>

        <div
          className={`${
            !winner
              ? turn === -1
                ? 'black-signifier'
                : 'white-signifier'
              : turn === 1
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
// allow two players to play remotely
// refactor the code - readability, reusability
// support mobile devices
// a better appearance
// add sound effect
// add a countdown timer
// able to replay
// able to save a game and resume later on
// add AI
