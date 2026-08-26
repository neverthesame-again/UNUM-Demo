// CapabilitiesPanel Component - Display capabilities and quick actions

import { Icon } from "./Icon";

export const CapabilitiesPanel = ({ domain, onQuickActionClick }) => {
  return (
    <div className="prototype-box">
      <div className="prototype-label">Key Capabilities</div>
      <div>
        {domain.capabilities.map((cap, idx) => (
          <div key={idx} className="capability-row">
            <div className="capability-emoji">{cap.emoji}</div>
            <div>
              <div className="capability-title">{cap.title}</div>
              <div className="capability-description">{cap.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="divider">
        <div className="prototype-label" style={{ marginBottom: "12px" }}>
          Quick Actions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {domain.quickActions.map((action, idx) => (
            <button
              key={idx}
              className="quick-action-btn"
              onClick={() => onQuickActionClick(action)}
            >
              <Icon name="arrowRight" size={12} strokeWidth={2.5} />
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
