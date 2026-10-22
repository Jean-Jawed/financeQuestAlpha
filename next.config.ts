import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev : autoriser l'ouverture depuis un autre appareil du réseau local
  // (téléphone, tablette) via l'adresse « Network » affichée par next dev
  allowedDevOrigins: ["192.168.1.*"],
};

export default nextConfig;
