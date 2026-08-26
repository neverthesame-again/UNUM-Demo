// AiToolsTab Component - SEL Nexus agentic pipeline invocation

import { useState } from "react";
import { Icon } from "../Icon";
import { PipelineModal } from "./PipelineModal";
import {
  GREENFIELD_PIPELINE_URL,
  BROWNFIELD_PIPELINE_ENDPOINT,
} from "../../constants/pipeline";

const CARD_TITLE = "SEL Nexus";

export const AiToolsTab = ({ project }) => {
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);

  return (
    <div className="pd-ai-tools-tab">
      <div className="pd-ai-tools-card">
        <div className="pd-ai-tools-icon">
          <Icon name="zap" size={32} />
        </div>
        <h3 className="pd-ai-tools-title">Invoke {CARD_TITLE}</h3>
        <p className="pd-ai-tools-desc">
          Run SEL Nexus for &quot;{project.title}&quot; — governed, autonomous
          delivery from requirements through implementation.
        </p>

        <div className="pd-ai-tools-actions">
          <a
            href={GREENFIELD_PIPELINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pd-ai-tools-action greenfield"
            data-tooltip="Invoke Greenfield L3 Autonomous Pipeline"
            aria-label="Invoke Greenfield L3 Autonomous Pipeline"
          >
            <Icon name="externalLink" size={20} />
            <span className="pd-ai-tools-action-text">
              <span className="pd-ai-tools-action-title">Green Field</span>
              <span className="pd-ai-tools-action-subtitle">
                L3 Autonomous Pipeline
              </span>
            </span>
          </a>

          <button
            type="button"
            className="pd-ai-tools-action brownfield"
            onClick={() => setPipelineModalOpen(true)}
            data-tooltip="Invoke Application Enhancements L3 Pipeline"
            aria-label="Invoke Application Enhancements L3 Pipeline"
          >
            <Icon name="play" size={20} />
            <span className="pd-ai-tools-action-text">
              <span className="pd-ai-tools-action-title">
                Application Enhancements
              </span>
              <span className="pd-ai-tools-action-subtitle">
                L3 Autonomous Pipeline
              </span>
            </span>
          </button>
        </div>
      </div>

      <PipelineModal
        isOpen={pipelineModalOpen}
        onClose={() => setPipelineModalOpen(false)}
        appSlug={CARD_TITLE}
        featureDescription={project?.description || ""}
        endpoint={BROWNFIELD_PIPELINE_ENDPOINT}
        onStarted={() => {}}
      />
    </div>
  );
};
