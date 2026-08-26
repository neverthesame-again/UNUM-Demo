// ComingSoonTab Component - Placeholder for upcoming tabs

export const ComingSoonTab = ({ tabName, icon }) => {
  return (
    <div className="pd-coming-soon-tab">
      <div className="pd-coming-soon-icon">{icon || "🚀"}</div>
      <h3 className="pd-coming-soon-title">{tabName}</h3>
      <p className="pd-coming-soon-desc">
        This section is coming soon. Stay tuned for updates!
      </p>
      <div className="pd-coming-soon-badge">Coming Soon</div>
    </div>
  );
};
