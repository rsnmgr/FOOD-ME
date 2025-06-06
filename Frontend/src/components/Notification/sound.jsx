import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SoundFile from '../../assets/sound.wav';

const SoundPlayer = forwardRef((props, ref) => {
  const audioRef = useRef(null);

  const playSound = () => {
    const notificationSetting = localStorage.getItem("notificationOrder");
    if (notificationSetting === "on" && audioRef.current) {
      audioRef.current.play();
    }
  };

  useImperativeHandle(ref, () => ({
    playSound,
  }));

  return (
    <audio ref={audioRef} src={SoundFile} preload="auto" />
  );
});

export default SoundPlayer;
