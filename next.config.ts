import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera a pasta /out usada pelo Capacitor para empacotar o app Android.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
