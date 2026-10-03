import axios from "axios";


const axiosInstance = axios.create({

    baseURL: process.env.NEXT_PUBLIC_API_URL,

    withCredentials: true,

    headers: {
        "Content-Type": "application/json"
    }
});


let isRefreshing = false;

let pendingRequests = [];


const processPendingRequests = (error = null) => {

    pendingRequests.forEach((request) => {

        if (error) {
            request.reject(error);
        } else {
            request.resolve();
        }
    });

    pendingRequests = [];
};


axiosInstance.interceptors.response.use(

    (response) => {

        return response;
    },


    async (error) => {

        const originalRequest = error.config;


        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }


        // Do not try to refresh the refresh request itself.
        if (
            originalRequest?.url?.includes(
                "/auth/refresh"
            )
        ) {
            return Promise.reject(error);
        }


        originalRequest._retry = true;


        if (isRefreshing) {

            return new Promise((resolve, reject) => {

                pendingRequests.push({
                    resolve,
                    reject
                });

            }).then(() => {

                return axiosInstance(originalRequest);
            });
        }


        isRefreshing = true;


        try {

            await axiosInstance.post(
                "/auth/refresh"
            );


            processPendingRequests();

            return axiosInstance(originalRequest);

        } catch (refreshError) {

            processPendingRequests(refreshError);

            return Promise.reject(refreshError);

        } finally {

            isRefreshing = false;
        }
    }
);


export default axiosInstance;