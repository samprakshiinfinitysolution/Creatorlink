import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./root_reducer.js";


const store = configureStore({
    reducer: rootReducer
});


export default store;