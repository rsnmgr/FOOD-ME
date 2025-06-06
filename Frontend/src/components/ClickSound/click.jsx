import clickSound from '../../assets/click.wav'; // Adjust path if needed

let audio = new Audio(clickSound);

export const playClickSound = () => {
  const soundSetting = localStorage.getItem("buttonClickSound");
  if (soundSetting === "on") {
    audio.currentTime = 0;
    audio.play().catch((e) => {
      console.warn("Audio play failed:", e);
    });
  }
};
