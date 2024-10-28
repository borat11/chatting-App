import { configureStore } from "@reduxjs/toolkit";
import LoginSlice from "./slice/LoginSlice";
import ActiveSingleSlice from "./slice/ActiveSingleSlice";

const store = configureStore({
    reducer:{
        login:LoginSlice,
        active:ActiveSingleSlice
    }
})

export default store