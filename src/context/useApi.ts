import {useEffect} from "react";
import {useAuth} from "@/src/context/AuthContext";
import api from "@/src/libs/axios";

export const useApi = () => {
    const {token, loading} = useAuth();

    useEffect(() => {

        const interceptorId = api.interceptors.request.use(
            (config) => {
                // If context token isn't ready, see if it was attached previously to avoid dropouts
                const activeToken = token || api.defaults.headers.common["Authorization"]?.toString().split(" ")[1];

                if (activeToken) {
                    config.headers["Authorization"] = `Bearer ${activeToken}`;
                } else {
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(interceptorId);
        };
    }, [token, loading]);

    return api;
};
