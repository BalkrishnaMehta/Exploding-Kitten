import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showDiv: false,
  card: 5,
  defuseCounter: 0,
  modalContent: {},
  currentCard: null,
};

export const GameComponentSlice = createSlice({
  name: 'GameComponent',
  initialState,
  reducers: {
    toggleDiv(state) {
      return { ...state, showDiv: true };
    },
    drawCard(state, action) {
      const newCardCount = action.payload !== undefined ? action.payload : state.card - 1;
    
      if (newCardCount >= 0) {
        return { ...state, card: newCardCount };
      }
    
      return state;
    },    
    setDefuseCounter(state, action) {
      return { ...state, defuseCounter: action.payload };
    },
    setModalContent(state, action) {
      return { ...state, modalContent: action.payload };
    },
    setCurrentCard(state, action) {
      return { ...state, currentCard: action.payload };
    },
  },
});

export const {
  toggleDiv,
  drawCard,
  setDefuseCounter,
  setModalContent,
  setCurrentCard,
} = GameComponentSlice.actions;
export default GameComponentSlice.reducer;