import axios from "axios";

//const BASE_URL = 'https://ypgblessedbits.azurewebsites.net';
const BASE_URL = "http://127.0.0.1:8000";

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});
