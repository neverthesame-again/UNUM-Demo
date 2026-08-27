import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function InfraPage() {
  const { logout } = useAuth();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'INFRA_LOGOUT') {
        logout();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [logout]);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}>
      <iframe
        src="/infra/index.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="AI for Infra Dashboard"
      />
    </div>
  );
}
