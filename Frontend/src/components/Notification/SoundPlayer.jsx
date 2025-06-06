import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import SoundFile from '../../assets/notification.wav'; // Adjust path if needed

const SoundPlayer = forwardRef((props, ref) => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Pre-load the audio when component mounts
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  const playSound = async () => {
    try {
      const notificationSetting = localStorage.getItem("notification") || "on";
      if (notificationSetting === "on" && audioRef.current) {
        // Reset the audio to start
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    playSound,
  }));

  return (
    <audio 
      ref={audioRef} 
      src={SoundFile} 
      preload="auto"
      style={{ display: 'none' }}
    />
  );
});

SoundPlayer.displayName = 'SoundPlayer';

export default SoundPlayer;