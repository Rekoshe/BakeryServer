import axios from "axios";
import { databaseURI } from "../constants";

const axiosInstance = axios.create({
    baseURL:databaseURI,
    timeout: 5000,
})

export default axiosInstance;