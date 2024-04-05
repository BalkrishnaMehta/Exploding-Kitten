import { configureStore } from '@reduxjs/toolkit';
import GameComponentReducer from './reducers';

const store = configureStore({
  reducer: {
    GameComponent: GameComponentReducer,
  },
});

export default store;
