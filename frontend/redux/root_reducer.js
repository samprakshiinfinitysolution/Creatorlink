import {
    combineReducers
} from "@reduxjs/toolkit";

import authReducer from "./auth/auth_slice";
import profileReducer from "./creator/profile/profile_slice";
import portfolioReducer from "./creator/portfolio/portfolio_slice";
import servicesReducer from "./creator/services/services_slice";


const rootReducer = combineReducers({

    auth: authReducer,
    profile: profileReducer,
    portfolio: portfolioReducer,
    services: servicesReducer

});


export default rootReducer;