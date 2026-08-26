// PipelineModal Component - Brownfield/Greenfield automation pipeline launcher
// Headless state/logic lives in usePipelineModal(); this just wires it into
// the shared Modal + form styles used across the app.

import { useState } from "react";
import { Modal } from "../Modal";
import { Icon } from "../Icon";
import { usePipelineModal } from "../../hooks/usePipelineModal";

const STATUS_COLORS = {
  info: "#8dd8f0",
  success: "#50c878",
  error: "#ef4444",
};

export const PipelineModal = ({
  isOpen,
  onClose,
  appSlug,
  featureDescription,
  endpoint,
  onStarted,
}) => {
  const pipeline = usePipelineModal({
    isOpen,
    appSlug,
    featureDescription,
    endpoint,
    onStarted,
  });

  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pipeline.setFile(dropped);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoke Automation Pipeline">
      <div className="form-group">
        <label htmlFor="pipeline-name" className="form-label">
          Pipeline Name
        </label>
        <input
          type="text"
          id="pipeline-name"
          className="form-input"
          value={pipeline.name}
          onChange={(e) => pipeline.setName(e.target.value)}
          placeholder="e.g., brownfield_1234"
        />
      </div>

      <div className="form-group">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="pipeline-description" className="form-label">
            Feature Description
          </label>
          <button
            type="button"
            className="btn-secondary"
            onClick={pipeline.handleEnhance}
            disabled={pipeline.enhancing}
          >
            {pipeline.enhancing ? "Enhancing..." : "AI Enhance"}
          </button>
        </div>
        <textarea
          id="pipeline-description"
          className="form-textarea"
          value={pipeline.description}
          onChange={(e) => pipeline.setDescription(e.target.value)}
          placeholder="Describe the feature or requirement..."
          rows={6}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Requirement Doc Sources</label>
        {pipeline.file ? (
          <div className="pd-upload-file">
            <span className="pd-upload-file-icon">
              <Icon name="file" size={18} />
            </span>
            <span className="pd-upload-file-name">{pipeline.file.name}</span>
            <button
              type="button"
              className="pd-upload-file-remove"
              onClick={() => pipeline.setFile(null)}
              aria-label="Remove uploaded file"
              title="Remove file"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="pipeline-prd-file"
            className={`pd-upload-dropzone${dragOver ? " dragover" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <span className="pd-upload-dropzone-icon">
              <Icon name="upload" size={22} />
            </span>
            <span className="pd-upload-text">
              <span>Click to upload</span> or drag and drop
            </span>
            <span className="pd-upload-hint">
              Upload a requirement document (.pdf, .md, .txt, .docx) or
              reference sources such as Slack messages, Mural boards, or
              emails in the feature description above.
            </span>
            <input
              type="file"
              id="pipeline-prd-file"
              className="pd-upload-input"
              accept=".pdf,.md,.txt,.docx"
              onChange={pipeline.handleFileChange}
            />
          </label>
        )}
      </div>

      {pipeline.status && (
        <div
          className="pd-completion-banner"
          style={{ color: STATUS_COLORS[pipeline.status.type] }}
        >
          {pipeline.status.message}
        </div>
      )}

      {pipeline.result && (
        <div className="pd-completion-banner" style={{ color: STATUS_COLORS.success }}>
          <span className="pd-completion-icon">
            <Icon name="zap" size={16} />
          </span>
          <span>
            Pipeline &quot;{pipeline.result.name}&quot; started
            {pipeline.result.taskId ? ` (task ${pipeline.result.taskId})` : ""}.
            {pipeline.result.trackingLink && (
              <>
                {" "}
                <a
                  href={pipeline.result.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-tracking-link"
                >
                  View tracking
                </a>
              </>
            )}
          </span>
        </div>
      )}

      <div className="form-actions">
        {!pipeline.result && (
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={pipeline.result ? onClose : pipeline.handleSubmit}
          disabled={
            !pipeline.result &&
            (!pipeline.isSubmitReady || pipeline.loading || pipeline.enhancing)
          }
        >
          {pipeline.result ? "Done" : pipeline.loading ? "Starting..." : "Submit"}
        </button>
      </div>
    </Modal>
  );
};
