import blackPlacementSound from './assets/placement.mp3';
import whitePlacementSound from './assets/placement2.wav';
import backSound from './assets/back.wav';
import clearSound from './assets/clear-board.mp3';
import winSound from './assets/win.wav';
import winSound2 from './assets/win2.wav';

export const BASE = 'https://go-five-26255-default-rtdb.firebaseio.com/room';
export const DELAY = 2000; // update the data every 2s, causing maximum 2s of delay among users in real time

export const specialSpaces = new Set([48, 56, 112, 168, 176]);

// Audios
export const blackPlacementAudio = new Audio(blackPlacementSound);
export const whitePlacementAudio = new Audio(whitePlacementSound);
export const backAudio = new Audio(backSound);
export const clearAudio = new Audio(clearSound);
export const winAudio = new Audio(winSound);
export const winAudio2 = new Audio(winSound2);

// functions

// room id must be a non-negative integer between 0 and 99999999
export const getRoomIdFromQuery = () => {
  const queryRoomNum = +new URLSearchParams(window.location.search).get('room');
  return isNaN(queryRoomNum) ||
    queryRoomNum < 0 ||
    queryRoomNum >= Math.pow(10, 8)
    ? 0
    : queryRoomNum;
};

// given a query string, change the current url accordingly
export const setQuery = qs => {
  window.history.pushState({}, '', `${window.location.pathname}${qs}`);
};
