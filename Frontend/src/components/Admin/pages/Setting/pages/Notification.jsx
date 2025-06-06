import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Notification() {
  const { t } = useTranslation();

  const [orderNotification, setOrderNotification] = useState(false);
  const [buttonClickSound, setButtonClickSound] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem("notificationOrder");
    const savedSound = localStorage.getItem("buttonClickSound");
    if (savedOrder === "on") setOrderNotification(true);
    if (savedSound === "on") setButtonClickSound(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationOrder", orderNotification ? "on" : "off");
  }, [orderNotification]);

  useEffect(() => {
    localStorage.setItem("buttonClickSound", buttonClickSound ? "on" : "off");
  }, [buttonClickSound]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor="order-notification">{t("notificationForOrder")}</label>
        <input
          id="order-notification"
          type="checkbox"
          checked={orderNotification}
          onChange={() => setOrderNotification(prev => !prev)}
        />
      </div>
      <div className="flex justify-between items-center">
        <label htmlFor="click-sound">{t("buttonClickSound")}</label>
        <input
          id="click-sound"
          type="checkbox"
          checked={buttonClickSound}
          onChange={() => setButtonClickSound(prev => !prev)}
        />
      </div>
    </div>
  );
}
