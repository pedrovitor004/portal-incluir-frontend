import axios from "axios";
import { apiConfig } from "../config/api";

export const http = axios.create(apiConfig);
