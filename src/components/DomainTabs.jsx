// DomainTabs Component - Tab navigation for domain detail page

import { Icon } from "./Icon";

export const DomainTabs = ({ tabs, activeTab, onTabChange }) => {
  const getIcon = (key) => {
    switch (key) {
      case "workspace":
        return <Icon name="monitor" size={14} />;
      case "videos":
        return <Icon name="play" size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => onTabChange(tab.key)}
        >
          {getIcon(tab.key)}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
