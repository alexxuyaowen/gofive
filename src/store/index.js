import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './board';

const store = configureStore({
  reducer: { board: boardReducer },
});

export default store;
