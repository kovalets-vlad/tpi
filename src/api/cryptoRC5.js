import { executeRequest } from "../utils/executeRequest";
import axios from "./axios";
import { triggerFileDownload } from "../utils/triggerFileDownload";

export const encryptText = async (password, text) => {
    const requestData = { password, text };

    return executeRequest(
        () =>
            axios.post("/text/encrypt", requestData, {
                responseType: "json",
            }),
        200,
        "Success"
    );
};

export const decryptText = async (password, encrypted_data_b64) => {
    const requestData = { password, encrypted_data_b64 };

    return executeRequest(
        () =>
            axios.post("/text/decrypt", requestData, {
                responseType: "json",
            }),
        200,
        "Success"
    );
};

export const encryptFile = async (password, file) => {
    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);

    try {
        const response = await axios.post("/file/encrypt", formData, {
            responseType: "blob",
        });

        triggerFileDownload(response);
        return { success: true };
    } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
            throw new Error(err.response.data.detail);
        }
        throw err;
    }
};

export const decryptFile = async (password, file) => {
    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);
    formData.append("original_filename", file.name);

    try {
        const response = await axios.post("/file/decrypt", formData, {
            responseType: "blob",
        });
        triggerFileDownload(response);
        return { success: true };
    } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
            throw new Error(err.response.data.detail);
        }
        throw err;
    }
};
