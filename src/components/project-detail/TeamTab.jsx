// TeamTab Component - Project team members view

import { useState, useEffect } from "react";
import { domainDetailService } from "../../services/domain-detail.service";

export const TeamTab = ({ project }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await domainDetailService.getMembersByProjectId(
          project.id,
        );
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch project members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [project.id]);

  // Generate initials from name
  const getInitials = (name, storedInitials) => {
    if (storedInitials) return storedInitials;
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="pd-team-tab">
      <div className="pd-team-header">
        <span className="pd-team-icon">👥</span>
        <div>
          <h3 className="pd-team-title">Project Team</h3>
          <p className="pd-team-subtitle">
            Key members working on this project
          </p>
        </div>
      </div>

      {members.length > 0 ? (
        <div className="pd-team-grid">
          {members.map((member) => (
            <div key={member.id} className="pd-team-member-card">
              <div
                className="pd-member-avatar"
                style={{ background: member.avatarColor || "#6366f1" }}
              >
                {getInitials(member.name, member.avatarInitials)}
              </div>
              <div className="pd-member-info">
                <div className="pd-member-name">{member.name}</div>
                <div className="pd-member-role">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">👤</div>
          <h3>No Team Members</h3>
          <p>Team members will appear here once added by an admin.</p>
        </div>
      )}
    </div>
  );
};
