"use client";

import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api", // Adjust your base URL or use relative path
    headers: {
        "Content-Type": "application/json",
    },
});



export default api;