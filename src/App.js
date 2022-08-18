import { Fragment, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { boardActions } from './store/board';
import axios from 'axios';

import Button from './components/Button';

import {
  BASE,
  DELAY,
  specialSpaces,
  blackPlacementAudio,
  whitePlacementAudio,
  backAudio,
  clearAudio,
  winAudio,
  winAudio2,
  valid,
} from './Constants';

// fetch board data from the database
const loadBoard = async (dispatch, url) => {
  await axios.get(url).then(({ data }) => {
    if (data) {
      dispatch(
        boardActions.setBoard({
          board: data.board,
          history: data.history,
          turn: data.history.length % 2 === 0 ? -1 : 1,
        })
      );
    } else {
      dispatch(boardActions.clearBoard());
    }
  });
};

function App() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.board.board);
  const history = useSelector(state => state.board.history);
  const turn = useSelector(state => state.board.turn);

  const [isLoading, setIsLoading] = useState(true);

  const [winner, setWinner] = useState(0); // 0 for none, -1 if black wins, 1 if white wins
  const [theFive, setTheFive] = useState([]); // an array to keep track the five winning pieces to trigger animations
  const [shouldUpdate, setShouldUpdate] = useState(false); // prevent unwanted behaviors caused by the periodical GET requests

  // room id, a non-negative integer between 0 and 99999999
  const roomQuery = +new URLSearchParams(window.location.search).get('room');
  const [roomIdTemp, setRoomIdTemp] = useState(
    (roomQuery > 0 && roomQuery < Math.pow(10, 8)) > 0 ? roomQuery : 0
  );
  const [roomId, setRoomId] = useState(roomIdTemp);
  const inputFocus = useRef(roomIdTemp);
  const apiURL = useRef(`${BASE}/${roomId}.json`);

  // console.log(roomId, roomIdTemp);

  // initial load
  useEffect(() => {
    setRoomId(+new URLSearchParams(window.location.search).get('room'));
    loadBoard(dispatch, apiURL.current);
    setIsLoading(false);
  }, [dispatch]);

  // periodically update the board data every 2s to keep the board updated with the database
  // enable the users to interact remotely
  useEffect(() => {
    const interval = setInterval(() => {
      loadBoard(dispatch, apiURL.current);
    }, DELAY);
    return () => clearInterval(interval);
  }, [dispatch]);

  // update the api url and the url query string on change of roomId
  useEffect(() => {
    if (roomId >= 0 && roomId < Math.pow(10, 8)) {
      apiURL.current = `${BASE}/${roomId}.json`;
      window.history.pushState(
        {},
        '',
        `${window.location.pathname}${roomId === 0 ? '' : `?room=${roomId}`}`
      );
    }
  }, [roomId]);

  // make a patch request on any change to the board
  useEffect(() => {
    if (history.length && shouldUpdate) {
      axios.patch(apiURL.current, {
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
      const [x, y] = [pos % 15, (pos / 15) | 0];

      if (
        (dir === 1 && x > 10) ||
        (dir === 14 && (x < 4 || y > 10)) ||
        (dir === 15 && y > 10) ||
        (dir === 16 && (x > 10 || y > 10))
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
      winAudio.play().catch(e => {});
      winAudio2.play().catch(e => {});
    }
  }, [winner]);

  const placeOnBoard = pos => () => {
    if (!winner) {
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
    axios.delete(apiURL.current);
  };

  const keyDownHandler = e => {
    // console.log(e.key);
    if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'b') {
      back();
    } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'c') {
      clear();
    } else if (e.key === ' ') {
      inputFocus.current.focus();
    }
  };

  // room ID must be an non-negative integer with no leading zeros
  const setIdTemp = e => {
    if (e.target.value.match(/^[0-9]*$/g)) setRoomIdTemp(+e.target.value);
  };

  const enterHandler = e => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const inputBlurHandler = () => {
    if (roomIdTemp === roomId) return;

    if (roomIdTemp === '') {
      setRoomIdTemp(roomId);
    } else {
      setIsLoading(true);
      setRoomId(+roomIdTemp);
    }
  };

  const inputFocusHandler = () => {
    setRoomIdTemp('');
  };

  return (
    <Fragment>
      <header>
        {/* <label htmlFor='room-id'>Room #:</label> */}
        <input
          id='room-id'
          ref={inputFocus}
          value={valid(roomIdTemp)}
          placeholder={valid(roomId)}
          onChange={setIdTemp}
          onKeyDown={enterHandler}
          onBlur={inputBlurHandler}
          onFocus={inputFocusHandler}
          tabIndex={0}
          autoComplete='off'
          maxLength={8}
        />
      </header>

      <main
        className={`board ${winner && 'prohibited'} ${isLoading && 'loading'}`}
        tabIndex={0}
        onKeyDown={keyDownHandler}
      >
        {board.map((piece, pos) => (
          <span
            key={pos}
            className={`space ${piece && (piece === -1 ? 'black' : 'white')} ${
              !piece && specialSpaces.has(pos) && 'special-space'
            } ${theFive.includes(pos) && 'winning-pieces'} ${
              !piece && !winner && (turn === -1 ? 'black-hover' : 'white-hover')
            }`}
            onClick={placeOnBoard(pos)}
          />
        ))}
      </main>

      <footer className='toolkit' tabIndex={0} onKeyDown={keyDownHandler}>
        <Button
          onClick={back}
          disabled={history.length === 0}
          symbol='back-symbol'
        >
          ⇦
        </Button>

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

        <Button
          onClick={clear}
          disabled={history.length === 0}
          symbol='clear-symbol'
        >
          X
        </Button>
      </footer>
    </Fragment>
  );
}

export default App;

// To do:
// clean up App.js
// refactor the code - readability, reusability
// write tests
// support mobile devices?
// add a countdown timer?
// add AI?

// Done:
// able to play in seperate rooms
// add sound effect
// able to save a game and resume later on
// allow two players to play remotely
