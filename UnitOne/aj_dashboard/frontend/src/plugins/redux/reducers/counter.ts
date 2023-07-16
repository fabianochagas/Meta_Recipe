import { createSlice } from '@reduxjs/toolkit'
 
interface CounterState {
  value: number
}

const initialState = { value: 0 } as CounterState

const counterSlice = createSlice({
  name: 'counter',
  initialState:0 as number,
  reducers: {
    increment: (state) => state + 1,
    decrement(state) {
      state--
    },
    printCounter(state){
      return state
    },
    
  },
})

export const { increment, decrement ,printCounter} = counterSlice.actions
export default {
    counter: counterSlice.reducer
};