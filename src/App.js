import { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { boardActions } from './store/board';
import axios from 'axios';

const specialSpaces = new Set([48, 56, 112, 168, 176]);
const BASE = 'https://go-five-26255-default-rtdb.firebaseio.com/room';
const roomId = 0;

function App() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.board.board);
  const history = useSelector(state => state.board.history);
  const turn = useSelector(state => state.board.turn);

  const [winner, setWinner] = useState(0);
  const [theFive, setTheFive] = useState([]);
  // const [roomId, setRoomId] = useState(0);

  // update the board data every 2s to keep the board updated with the database
  // enable the users to interact remotely
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${BASE}/${roomId}.json`).then(({ data }) => {
        data
          ? dispatch(
              boardActions.setBoard({
                board: data.board,
                history: data.history,
                turn: data.history.length % 2 === 0 ? -1 : 1,
              })
            )
          : dispatch(boardActions.clearBoard());
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // make a patch request on any change to the board
  useEffect(() => {
    if (history.length) {
      axios.patch(`${BASE}/${roomId}.json`, {
        board,
        history,
      });
    }
  }, [history, board]);

  // check game condition on each turn
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
          return true;
        }
      }

      return false;
    };

    if (checkWinning(blacks) || checkWinning(whites)) {
      setWinner(turn);
    } else {
      setWinner(0);
      setTheFive([]);
    }
  }, [history, turn]);

  const placeOnBoard = pos => () => {
    if (!winner) {
      dispatch(boardActions.placeOnBoard(pos));
    }
  };

  const back = () => {
    history.length > 1 ? dispatch(boardActions.back()) : quit();
  };

  const quit = () => {
    dispatch(boardActions.clearBoard());
    axios.delete(`${BASE}/${roomId}.json`);
  };

  // const joinRoom = () => {
  //   setRoomId(prev => prev + 1);
  // };

  return (
    <Fragment>
      {/* <h1 id='room-id' onClick={joinRoom}>
        {roomId}
      </h1> */}

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
        <button onClick={back} disabled={history.length === 0}>
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

        <button onClick={quit} disabled={history.length === 0}>
          <span id='quit-symbol'>X</span>
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
