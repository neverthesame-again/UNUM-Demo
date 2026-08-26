// DomainCard Component - Reusable card for displaying domains

import { Icon } from "./Icon";

export const DomainCard = ({ domain, onClick }) => {
  return (
    <div
      className="domain-card"
      style={{ "--accent-color": domain.accentColor }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="domain-card-header">
        <div
          className="domain-icon"
          style={{ background: domain.iconBg, color: domain.accentColor }}
        >
          <Icon name={domain.iconKey} color={domain.accentColor} />
        </div>
        <div className="domain-title">{domain.title}</div>
      </div>
      <div className="domain-description">{domain.description}</div>
      {/* <div className="domain-arrow">
        Explore <Icon name="arrowRight" size={13} strokeWidth={2.5} />
      </div> */}
    </div>
  );
};
