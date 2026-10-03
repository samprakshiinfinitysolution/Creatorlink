import {
    combineReducers
} from "@reduxjs/toolkit";

import authReducer from "./auth/auth_slice";


const rootReducer = combineReducers({

    auth: authReducer

});


export default rootReducer;