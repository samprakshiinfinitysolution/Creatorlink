import {
    combineReducers
} from "@reduxjs/toolkit";

import authReducer from "./auth/auth_slice";
import profileReducer from "./creator/profile/profile_slice";
import portfolioReducer from "./creator/portfolio/portfolio_slice";
import servicesReducer from "./creator/services/services_slice";
import creatorCampaignsReducer from "./creator/campaigns/campaigns_slice";
import brandProfileReducer from "./brand/profile/profile_slice";
import brandCampaignsReducer from "./brand/campaigns/campaigns_slice";
import brandBookingsReducer from "./brand/bookings/bookings_slice";


const rootReducer = combineReducers({

    auth: authReducer,
    profile: profileReducer,
    portfolio: portfolioReducer,
    services: servicesReducer,
    creatorCampaigns: creatorCampaignsReducer,
    brandProfile: brandProfileReducer,
    brandCampaigns: brandCampaignsReducer,
    brandBookings: brandBookingsReducer

});


export default rootReducer;