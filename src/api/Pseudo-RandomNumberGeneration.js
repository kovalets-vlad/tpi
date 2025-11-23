import { executeRequest } from "../utils/executeRequest";
import axios from "./axios";

export const random = async (data) => {
    return executeRequest(
        () =>
            axios.post("/lcg/random", data, {
                responseType: data.isFileDownload ? "blob" : "json",
            }),
        200,
        "Success"
    );
};

export const testGenerator = async (n = 10000) => {
    return executeRequest(() => axios.post("/lcg/test_generator", n));
};

export const getPeriod = async () => {
    return executeRequest(() => axios.get("/lcg/period"));
};
