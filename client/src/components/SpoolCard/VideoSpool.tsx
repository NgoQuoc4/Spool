import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import type { ThreadPost } from "@/types";

const VideoSpool = ({ post }: { post: ThreadPost }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  const isVideo = post?.media?.type === "hls" || post?.media?.type === "video";

  useEffect(() => {
    if (!isVideo || !post.media?.urls || post.media.urls.length === 0) return;

    const video = videoRef.current;
    if (!video) return;

    const primaryUrl = post.media.urls[0];
    const fallbackUrl = post.media.urls[1];

    setVideoError(false);

    // If standard mp4 / video format
    if (post.media.type === "video" || primaryUrl.endsWith(".mp4")) {
      video.src = primaryUrl;
      video.onerror = () => {
        if (fallbackUrl && video.src !== fallbackUrl) {
          video.src = fallbackUrl;
        } else {
          setVideoError(true);
        }
      };
      return;
    }

    // If HLS (.m3u8) format
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(primaryUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, () => {
        // Fallback to sample mp4 if local stream is offline
        if (fallbackUrl) {
          hls.destroy();
          video.src = fallbackUrl;
        } else {
          setVideoError(true);
        }
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS native HLS support
      video.src = primaryUrl;
      video.onerror = () => {
        if (fallbackUrl) video.src = fallbackUrl;
      };
    } else if (fallbackUrl) {
      video.src = fallbackUrl;
    }
  }, [isVideo, post?.media]);

  if (!isVideo) return null;

  return (
    <div
      style={{
        marginBottom: "12px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
        backgroundColor: "#000",
      }}
    >
      <video
        ref={videoRef}
        controls
        playsInline
        style={{
          width: "100%",
          maxHeight: "420px",
          display: "block",
        }}
      />
      {videoError && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          Video stream pending upload or server offline.
        </div>
      )}
    </div>
  );
};

export default VideoSpool;
