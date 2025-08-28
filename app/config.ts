// config.ts
const LOCAL_API = "http://192.168.15.81:3000"; // your Mac's LAN IP for dev
const PROD_API = "https://alugavaga.com.br";

export const API_URL =
  process.env.NODE_ENV === "development" ? LOCAL_API : PROD_API;