import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    active:[]
}

export const ActiveSingleSlice = createSlice({
    name: "Single",  
    initialState: {
        active: JSON.parse(localStorage.getItem('active')) || null  
    },
    reducers: {
        ActiveSingle: (state, action) => {
            state.active = action.payload;
        },
        NonActiveSingle: (state) => {
            state.active = null;
        }
       
    }
});

export const {  ActiveSingle,NonActiveSingle } = ActiveSingleSlice.actions;
export default ActiveSingleSlice.reducer;
