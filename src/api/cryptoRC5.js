import axios from "./axios";
import { executeRequest } from "../utils/executeRequest";
import { triggerSaveAs } from "../utils/triggerSaveAs";
import { handleError } from "../utils/executeRequest";

export const encryptText = async (password, text) => {
    const requestData = { password, text };

    return executeRequest(
        () =>
            axios.post("/rc5/text/encrypt", requestData, {
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
            axios.post("/rc5/text/decrypt", requestData, {
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
        const response = await axios.post("/rc5/file/encrypt", formData, {
            responseType: "blob",
        });

        await triggerSaveAs(response);

        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};

export const decryptFile = async (password, file) => {
    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);

    let originalName = file.name;

    const lastDotIndex = originalName.lastIndexOf(".");

    if (lastDotIndex !== -1) {
        const namePart = originalName.substring(0, lastDotIndex);
        const extPart = originalName.substring(lastDotIndex);

        if (namePart.endsWith("_encrypted")) {
            originalName = namePart.slice(0, -10) + extPart;
        }
    }

    formData.append("original_filename", originalName);

    try {
        const response = await axios.post("/rc5/file/decrypt", formData, {
            responseType: "blob",
        });

        await triggerSaveAs(response);

        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};

export const encryptTextToFile = async (password, text) => {
    const requestData = { password, text };

    try {
        const response = await axios.post("/rc5/text-to-file/encrypt", requestData, {
            responseType: "blob",
        });

        await triggerSaveAs(response);

        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};

export const decryptFileToText = async (password, file) => {
    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);

    return executeRequest(
        () =>
            axios.post("/rc5/file-to-text/decrypt", formData, {
                responseType: "json",
            }),
        200,
        "Success"
    );
};
