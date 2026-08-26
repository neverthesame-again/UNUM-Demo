// OverviewTab Component - Project phases/lifecycle progress view
// Phases are passed as a prop from ProjectDetailPage (no duplicate fetch)
// Current phase is auto-computed: first phase (by displayOrder) with progress < 100%

export const OverviewTab = ({ project, phases, computedStatus }) => {
  // Auto-compute current phase index: first phase where progress < 100
  const currentPhaseIndex = phases.findIndex((p) => p.progress < 100);

  // Derive the current phase object for the badge
  const currentPhase =
    currentPhaseIndex >= 0 ? phases[currentPhaseIndex] : null;

  // Determine phase state based on sequential unlock logic
  const getPhaseState = (index) => {
    // All phases complete — everything is unlocked
    if (currentPhaseIndex === -1) return "completed";
    if (index < currentPhaseIndex) return "completed";
    if (index === currentPhaseIndex) return "current";
    return "locked";
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "#50c878";
    if (progress >= 70) return "#f5a623";
    if (progress >= 40) return "#00c4ff";
    return "#1e6bff";
  };

  // Get the icon to display based on phase state
  const getPhaseIcon = (phase, state) => {
    if (state === "locked") return phase.iconEmoji;
    return phase.displayOrder;
  };

  return (
    <div className="pd-overview-tab">
      {/* Completion Banner */}
      {computedStatus === "Completed" && (
        <div className="pd-completion-banner">
          <span className="pd-completion-icon">✅</span>
          This project is marked complete. Phase history is shown below for
          reference.
        </div>
      )}

      {/* Program Phase Progress Header */}
      <div className="pd-phase-header">
        <div>
          <h3 className="pd-phase-title">Program Phase Progress</h3>
          <p className="pd-phase-subtitle">
            {project.type === "Brownfield"
              ? "Brownfield lifecycle aligned to program delivery"
              : "Greenfield lifecycle aligned to program delivery"}
          </p>
        </div>
        {currentPhase && (
          <div className="pd-current-phase-badge">
            CURRENT: {currentPhase.title.toUpperCase()}
          </div>
        )}
      </div>

      {/* Phase Cards */}
      {phases.length > 0 ? (
        <div className="pd-phases-list">
          {phases.map((phase, index) => {
            const state = getPhaseState(index);

            return (
              <div
                key={phase.id}
                className={`pd-phase-card ${state === "current" ? "current" : ""} ${state === "locked" ? "locked" : ""}`}
              >
                <div
                  className={`pd-phase-icon ${state === "locked" ? "locked" : ""}`}
                >
                  {getPhaseIcon(phase, state)}
                </div>
                <div className="pd-phase-content">
                  <h4 className="pd-phase-card-title">{phase.title}</h4>
                  <p className="pd-phase-card-subtitle">{phase.subtitle}</p>
                  <p className="pd-phase-card-desc">{phase.description}</p>
                  <div className="pd-phase-progress-section">
                    <div className="pd-phase-progress-header">
                      <span>Progress</span>
                      <span
                        style={{
                          color:
                            state === "locked"
                              ? "var(--muted)"
                              : getProgressColor(phase.progress),
                          fontWeight: 700,
                        }}
                      >
                        {state === "locked" ? "Locked" : `${phase.progress}%`}
                      </span>
                    </div>
                    <div className="pd-phase-progress-bar">
                      <div
                        className="pd-phase-progress-fill"
                        style={{
                          width:
                            state === "locked" ? "0%" : `${phase.progress}%`,
                          background:
                            state === "locked"
                              ? "transparent"
                              : `linear-gradient(90deg, ${getProgressColor(phase.progress)}, ${getProgressColor(phase.progress)}cc)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📋</div>
          <h3>No Phases Configured</h3>
          <p>Project phases will appear here once added by an admin.</p>
        </div>
      )}
    </div>
  );
};
