// Toast Component - Notification System

import { useState, useEffect } from "react";

let toastCallback = null;

export const useToast = () => {
  const showToast = (message) => {
    if (toastCallback) {
      toastCallback(message);
    }
  };

  return { showToast };
};

export const Toast = () => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastCallback = (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 3200);
    };

    return () => {
      toastCallback = null;
    };
  }, []);

  if (!visible) return null;

  return <div className="toast">{message}</div>;
};
