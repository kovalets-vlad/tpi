import axios from "./axios";
import { handleError } from "../utils/executeRequest";
import { triggerSaveAs } from "../utils/triggerSaveAs";

export const generateKeys = async (filenamePrefix) => {
    try {
        const response = await axios.post(
            "/dsa/keys/generate",
            { filename_prefix: filenamePrefix },
            { responseType: "blob" }
        );
        await triggerSaveAs(response);
        return { success: true };
    } catch (err) {
        await handleError(err);
        return null;
    }
};

export const signText = async (text, privateKeyFile) => {
    try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("private_key_file", privateKeyFile);

        const response = await axios.post("/dsa/sign/text", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        await handleError(err);
        return null;
    }
};

export const signFile = async (dataFile, privateKeyFile) => {
    try {
        const formData = new FormData();
        formData.append("file", dataFile);
        formData.append("private_key_file", privateKeyFile);

        const response = await axios.post("/dsa/sign/file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        await handleError(err);
        return null;
    }
};

export const verifyText = async (text, signatureHex, publicKeyFile) => {
    try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("signature_hex", signatureHex);
        formData.append("public_key_file", publicKeyFile);

        const response = await axios.post("/dsa/verify/text", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        await handleError(err);
        return null;
    }
};

export const verifyFile = async (dataFile, signatureHex, publicKeyFile) => {
    try {
        const formData = new FormData();
        formData.append("file", dataFile);
        formData.append("signature_hex", signatureHex);
        formData.append("public_key_file", publicKeyFile);

        const response = await axios.post("/dsa/verify/file", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (err) {
        await handleError(err);
        return null;
    }
};
