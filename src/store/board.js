import { createSlice } from '@reduxjs/toolkit';

// empty is 0, black is -1, white is 1
const initialBoard = {
  board: new Array(15 * 15).fill(0),
  history: [],
  turn: -1, // equivalent to (history.length % 2 === 0 ? -1 : 1), added to improve code readabilty
};

const boardSlice = createSlice({
  name: 'board',
  initialState: initialBoard,
  reducers: {
    placeOnBoard: (state, action) => {
      const pos = action.payload;

      if (state.board[pos] === 0) {
        state.board[pos] = state.turn;
        state.history.push(pos);
        state.turn = -state.turn;
      }
    },

    goBack: state => {
      state.board[state.history.at(-1)] = 0;
      state.history.pop();
      state.turn = -state.turn;
    },

    clearBoard: state => {
      state.board = initialBoard.board;
      state.history = initialBoard.history;
      state.turn = initialBoard.turn;
    },
  },
});

export const boardActions = boardSlice.actions;

export default boardSlice.reducer;
