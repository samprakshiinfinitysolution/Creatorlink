import axiosInstance from "@/lib/axios";

/**
 * Uploads a single image to Cloudinary via the backend upload endpoint.
 *
 * @param {File|Blob} file - The image file to upload.
 * @param {string} [folder="creatorlink/general"] - Target Cloudinary folder.
 * @returns {Promise<object>} The backend API response.
 */
const uploadSingleImageApi = async (file, folder = "creatorlink/general", options = {}) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await axiosInstance.post("/upload/image", formData, {
        timeout: options.timeout || 60000,
        onUploadProgress: options.onUploadProgress
    });

    return response.data;
};

/**
 * Uploads a single video to Cloudinary via the backend upload endpoint.
 * Videos can be up to 50 MB, so timeout is set to 300,000 ms (5 minutes) to avoid premature Axios aborts.
 *
 * @param {File|Blob} file - The video file to upload.
 * @param {string} [folder="creatorlink/deliverables"] - Target Cloudinary folder.
 * @param {object} [options={}] - Additional options (timeout, onUploadProgress).
 * @returns {Promise<object>} The backend API response.
 */
const uploadSingleVideoApi = async (file, folder = "creatorlink/deliverables", options = {}) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("folder", folder);

    const response = await axiosInstance.post("/upload/video", formData, {
        timeout: options.timeout || 300000, // 5 minutes (300,000 ms) for video uploads
        onUploadProgress: options.onUploadProgress
    });

    return response.data;
};

export {
    uploadSingleImageApi,
    uploadSingleVideoApi
};
export default uploadSingleImageApi;
