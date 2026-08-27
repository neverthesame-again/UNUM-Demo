import React from "react";

export default function InfraPage() {
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
