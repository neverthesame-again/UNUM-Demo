// RepositoryTab Component - Project repository documents view

import { useState, useEffect } from "react";
import { Icon } from "../Icon";
import { domainDetailService } from "../../services/domain-detail.service";
import {
  getFileTypeStyle,
  getDisplayFileName,
} from "../../constants/repository-file-types";

export const RepositoryTab = ({ project }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const data = await domainDetailService.getRepositoryFilesByProjectId(
          project.id,
        );
        setFiles(data);
      } catch (err) {
        console.error("Failed to fetch repository files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [project.id]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading repository...</p>
      </div>
    );
  }

  return (
    <div className="pd-repository-tab">
      <p className="pd-repo-subtitle">Documents related to this Project</p>

      {files.length > 0 ? (
        <>
          <h3 className="pd-repo-section-title">{project.title}</h3>
          <div className="pd-repo-grid">
            {files.map((file) => {
              const typeStyle = getFileTypeStyle(file.fileType);
              return (
                <div key={file.id} className="pd-repo-card">
                  <span
                    className="pd-repo-badge"
                    style={{
                      background: typeStyle.background,
                      color: typeStyle.color,
                    }}
                  >
                    {typeStyle.label}
                  </span>
                  <span className="pd-repo-name">
                    {getDisplayFileName(file.fileName, file.fileType)}
                  </span>
                  <a
                    className={`pd-repo-download ${!file.fileUrl ? "disabled" : ""}`}
                    href={file.fileUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!file.fileUrl) e.preventDefault();
                    }}
                    title={file.fileUrl ? "Open file" : "No link available"}
                  >
                    <Icon name="download" size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📁</div>
          <h3>No Documents Yet</h3>
          <p>Repository documents will appear here once added by an admin.</p>
        </div>
      )}
    </div>
  );
};
