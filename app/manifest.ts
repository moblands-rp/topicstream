import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Topic",
    short_name: "Topic",
    description: "Topic movie and TV streaming web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#3b82f6",
    orientation: "portrait",
    icons: [
      {
        src: "/topicNoBackground.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/topicNoBackground.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/topicNoBackground.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
