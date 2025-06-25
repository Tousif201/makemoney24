import { useEffect, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";

export default function SmartMedia({ src, alt = "", onClick }) {
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkIfVideo = async () => {
      const testVideo = document.createElement("video");
      if (testVideo.canPlayType("video/mp4") || testVideo.canPlayType("video/webm")) {
        testVideo.src = src;
        try {
          await testVideo.play();
          setIsVideo(true);
          testVideo.pause();
        } catch {
          setIsVideo(false);
        }
      }
    };

    checkIfVideo();
  }, [src]);

  return isVideo ? (
    <div className="relative w-full h-full group cursor-pointer" onClick={onClick}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors duration-200">
        <PlayCircle className="h-12 w-12 text-white" />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain bg-white cursor-pointer"
      onClick={onClick}
    />
  );
}
