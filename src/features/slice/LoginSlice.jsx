import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loggedIn:[]
}

export const userSlice = createSlice({
    name: "Login",  
    initialState: {
        loggedIn: JSON.parse(localStorage.getItem('user')) || null  
    },
    reducers: {
        loggedInUsers: (state, action) => {
            state.loggedIn = action.payload;
        },
        loggedOutUsers: (state) => {
            state.loggedIn = null;
        }
    }
});

export const { loggedInUsers, loggedOutUsers } = userSlice.actions;
export default userSlice.reducer;
