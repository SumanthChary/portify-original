
import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = "https://yvvqfcwhskthbbjspcvi.supabase.co/storage/v1/object/public/video//Video%20for%20Portify.mp4";
  const thumbnailUrl = "https://yvvqfcwhskthbbjspcvi.supabase.co/storage/v1/object/public/video//Screenshot%20(494).png";

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="flex flex-col items-center mb-10">
          <span className="tag-badge mb-4">Demo Video</span>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            See <span className="text-coral">Portify</span> in Action
          </h2>
          <p className="text-lg text-coolGray text-center max-w-2xl">
            Watch how easily you can transfer your digital products between platforms with our intuitive interface.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-card">
          <div className="relative w-full">
            <AspectRatio ratio={16 / 9} className="bg-black">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={thumbnailUrl}
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div></div> {/* Spacer */}
                
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={handlePlayPause}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleMuteToggle}
                      className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <button
                      onClick={handleFullscreen}
                      className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Center Play Button (visible when video is not playing) */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className="bg-coral/80 hover:bg-coral p-6 rounded-full text-white transform transition-transform hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play size={36} className="ml-1" />
                  </button>
                </div>
              )}
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
