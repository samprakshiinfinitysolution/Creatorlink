import axiosInstance from "@/lib/axios";

/**
 * Uploads a single image to Cloudinary via the backend upload endpoint.
 *
 * @param {File|Blob} file - The image file to upload.
 * @param {string} [folder="creatorlink/general"] - Target Cloudinary folder.
 * @returns {Promise<object>} The backend API response.
 */
const uploadSingleImageApi = async (file, folder = "creatorlink/general") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await axiosInstance.post("/upload/image", formData);

    return response.data;
};

export { uploadSingleImageApi };
export default uploadSingleImageApi;
