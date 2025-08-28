import { useEffect } from "react";
import * as WebBrowser from 'expo-web-browser';

// This file helps to 'warm up' the browser so that it is faster when the user signs in
// I.e. significantly improves performance
// It is recommended by Clerk
// This hook is called in login.tsx
export const userWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};