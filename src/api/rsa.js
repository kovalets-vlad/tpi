import axios from "./axios";
import { handleError } from "../utils/executeRequest";
import { triggerSaveAs } from "../utils/triggerSaveAs";

export const generateKeys = async () => {
    try {
        const response = await axios.get("/rsa/keys/generate", {
            responseType: "blob",
        });
        await triggerSaveAs(response);
        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};

export const encryptFileRSA = async (file, publicKeyFile) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("public_key", publicKeyFile);

    try {
        const response = await axios.post("/rsa/encrypt", formData, {
            responseType: "blob",
        });
        await triggerSaveAs(response);
        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};

export const decryptFileRSA = async (file, privateKeyFile) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("private_key", privateKeyFile);

    try {
        const response = await axios.post("/rsa/decrypt", formData, {
            responseType: "blob",
        });
        await triggerSaveAs(response);
        return { success: true };
    } catch (err) {
        await handleError(err);
    }
};
