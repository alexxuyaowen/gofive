import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { boardActions } from './store/board';
import axios from 'axios';

import blackPlacementSound from './assets/placement.mp3';
import whitePlacementSound from './assets/placement2.wav';
import backSound from './assets/back.wav';
import clearSound from './assets/clear-board.mp3';
import winSound from './assets/win.wav';
import winSound2 from './assets/win2.wav';

const specialSpaces = new Set([48, 56, 112, 168, 176]);
const BASE = 'https://go-five-26255-default-rtdb.firebaseio.com/room';
const roomId = 0;

// Audios
const blackPlacementAudio = new Audio(blackPlacementSound);
const whitePlacementAudio = new Audio(whitePlacementSound);
const backAudio = new Audio(backSound);
const clearAudio = new Audio(clearSound);
const winAudio = new Audio(winSound);
const winAudio2 = new Audio(winSound2);

function App() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.board.board);
  const history = useSelector(state => state.board.history);
  const turn = useSelector(state => state.board.turn);

  const [winner, setWinner] = useState(0); // 0 for none, -1 if black wins, 1 if white wins
  const [theFive, setTheFive] = useState([]); // an array to keep track the five winning pieces to trigger animations
  const [shouldUpdate, setShouldUpdate] = useState(false); // make sure one and only one patch request is made on each interaction

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
    if (history.length && shouldUpdate) {
      axios.patch(`${BASE}/${roomId}.json`, {
        board,
        history,
      });
      setShouldUpdate(false);
    }
  }, [history, board, shouldUpdate]);

  // check game condition on each turn
  useEffect(() => {
    const toCheck = new Set();

    history.forEach((pos, step) => {
      // a little weird but the logic is that 'turn' is changed immediately after making a move,
      // therefore, Black is usually found winning on White's turn, and vice versa.
      if ((turn === 1 && step % 2 === 0) || (turn === -1 && step % 2 === 1))
        toCheck.add(pos);
    });

    const directions = [1, 14, 15, 16];

    // helper to check each direction
    const checkOneDirection = (pos, dir) => {
      if (
        ((dir === 1 || dir === 14) && pos % 15 < 4) ||
        ((dir === 15 || dir === 16) && pos % 15 > 10)
      )
        return false;

      for (let i = 0; i < 5; i++) {
        if (!toCheck.has(pos + dir * i)) {
          return false;
        }
      }

      setTheFive([0, 1, 2, 3, 4].map(e => pos + dir * e));

      return true;
    };

    for (const pos of toCheck) {
      if (directions.some(dir => checkOneDirection(pos, dir))) {
        setWinner(turn);
        return;
      }
    }

    setWinner(0);
    setTheFive([]);
  }, [history, turn]);

  // play sound effects upon winning
  useEffect(() => {
    if (winner) {
      winAudio.play();
      winAudio2.play();
    }
  }, [winner]);

  const placeOnBoard = pos => () => {
    if (!winner && board[pos] === 0) {
      dispatch(boardActions.placeOnBoard(pos));
      (turn === -1 ? blackPlacementAudio : whitePlacementAudio).play();
      setShouldUpdate(true);
    }
  };

  const back = () => {
    backAudio.play();
    if (history.length > 1) {
      dispatch(boardActions.back());
      setShouldUpdate(true);
    } else {
      clear(false);
    }
  };

  const clear = (playSound = true) => {
    playSound && clearAudio.play();
    dispatch(boardActions.clearBoard());
    axios.delete(`${BASE}/${roomId}.json`);
  };

  const keyDownHandler = e => {
    // console.log(e.key);
    if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'b') {
      back();
    } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'c') {
      clear();
    }
  };

  // const joinRoom = () => {
  //   setRoomId(prev => prev + 1);
  // };

  return (
    <main tabIndex={0} onKeyDown={keyDownHandler}>
      {/* <h1 id='room-id' onClick={joinRoom}>
        {roomId}
      </h1> */}

      <div className={`board ${winner && 'prohibited'}`}>
        {board.map((piece, pos) => (
          <div
            key={pos}
            className={`space ${
              piece && (piece === -1 ? 'black prohibited' : 'white prohibited')
            } ${!piece && specialSpaces.has(pos) && 'special-space'} ${
              theFive.includes(pos) && 'winning-pieces'
            } ${
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

        <button onClick={clear} disabled={history.length === 0}>
          <span id='clear-symbol'>X</span>
        </button>
      </div>
    </main>
  );
}

export default App;

// To do:
// write tests
// refactor the code - readability, reusability
//
// support mobile devices
// add a countdown timer
// add AI

// Done:
// add sound effect
// able to save a game and resume later on
// allow two players to play remotely
