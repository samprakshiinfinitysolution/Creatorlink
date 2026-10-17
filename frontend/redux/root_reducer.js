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
import creatorWorkspaceReducer from "./creator/workspace/workspace_slice";
import brandWorkspaceReducer from "./brand/workspace/workspace_slice";
import creatorMessagesReducer from "./creator/messages/messages_slice";
import brandMessagesReducer from "./brand/messages/messages_slice";
import brandPaymentsReducer from "./brand/payments/payments_slice";
import creatorPaymentsReducer from "./creator/payments/payments_slice";
import creatorReviewsReducer from "./creator/reviews/reviews_slice";
import brandReviewsReducer from "./brand/reviews/reviews_slice";
import brandCreatorsReducer from "./brand/creators/creators_slice";
import brandNotificationsReducer from "./brand/notifications/notifications_slice";
import creatorNotificationsReducer from "./creator/notifications/notifications_slice";
import brandDashboardReducer from "./brand/dashboard/dashboard_slice";
import creatorDashboardReducer from "./creator/dashboard/dashboard_slice";


const rootReducer = combineReducers({

    auth: authReducer,
    profile: profileReducer,
    portfolio: portfolioReducer,
    services: servicesReducer,
    creatorCampaigns: creatorCampaignsReducer,
    brandProfile: brandProfileReducer,
    brandCampaigns: brandCampaignsReducer,
    brandBookings: brandBookingsReducer,
    creatorWorkspace: creatorWorkspaceReducer,
    brandWorkspace: brandWorkspaceReducer,
    creatorMessages: creatorMessagesReducer,
    brandMessages: brandMessagesReducer,
    brandPayments: brandPaymentsReducer,
    creatorPayments: creatorPaymentsReducer,
    creatorReviews: creatorReviewsReducer,
    brandReviews: brandReviewsReducer,
    brandCreators: brandCreatorsReducer,
    brandNotifications: brandNotificationsReducer,
    creatorNotifications: creatorNotificationsReducer,
    brandDashboard: brandDashboardReducer,
    creatorDashboard: creatorDashboardReducer

});


export default rootReducer;