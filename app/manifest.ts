import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Escalaí",
    short_name: "Escalaí",
    description: "Sua escala tá aí.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#b45309",
    icons: [
      { src: "/icon-192?v=2", sizes: "192x192", type: "image/png" },
      { src: "/icon-192?v=2&maskable", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512?v=2", sizes: "512x512", type: "image/png" },
      { src: "/icon-512?v=2&maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
