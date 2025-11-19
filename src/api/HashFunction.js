import { executeRequest } from "../utils/executeRequest";
import axios from "./axios";

export const hash = async (data) => {
    const requestData = {
        data: data,
    };
    return executeRequest(
        () =>
            axios.post("/md5", requestData, {
                responseType: "json",
            }),
        200,
        "Success"
    );
};

export const hashFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return executeRequest(
        () =>
            axios.post("/md5/file", formData, {
                responseType: "json",
            }),
        200,
        "Success"
    );
};
