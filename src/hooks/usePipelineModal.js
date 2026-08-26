import { useState } from "react";

// Used to build a default pipeline name like "brownfield_4821"
function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultPipelineName(appSlug) {
  const base = slugify(appSlug) || "pipeline";
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${base}_${suffix}`;
}

// Local fallback used when no AI "enhance" endpoint is configured.
function enhanceLocally(text) {
  const trimmed = text.trim();
  const sentences = trimmed
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const overview = sentences[0] || trimmed;
  const bullets = (sentences.length > 1 ? sentences.slice(1) : sentences)
    .map((sentence) => `• ${sentence.replace(/^[-•]\s*/, "")}`)
    .join("\n");

  return [
    "Overview",
    overview,
    "",
    "Detailed Requirements",
    bullets || `• ${overview}`,
    "",
    "Requirement Sources",
    "Reference supporting materials such as Slack threads, Mural boards, emails, or uploaded documents where applicable.",
  ].join("\n");
}

/**
 * Headless hook with all state + handlers for the "invoke pipeline" flow.
 * Wire these values into your own modal UI.
 *
 * const pipeline = usePipelineModal({
 *   isOpen,
 *   appSlug: "brownfield",
 *   featureDescription: project?.description || "",
 *   endpoint: "/api/automation-agents/external/start",
 *   onStarted: (data) => console.log(data),
 * });
 *
 * Returned shape:
 *   name, setName              -> pipeline name text input
 *   description, setDescription -> feature description textarea
 *   file, setFile              -> selected PRD file (or null)
 *   handleFileChange(e)        -> wire to <input type="file" onChange>
 *   handleEnhance()            -> "AI Enhance" button onClick
 *   handleSubmit()             -> "Submit" button onClick
 *   isSubmitReady              -> disable Submit when false
 *   status                     -> { type: 'info'|'success'|'error', message } | null
 *   result                     -> { name, taskId, trackingLink } | null (set after pipeline starts)
 *   loading, enhancing         -> booleans for spinners/disabled states
 */
export function usePipelineModal({
  isOpen,
  appSlug = "pipeline",
  featureDescription = "",
  endpoint = "/api/automation-agents/external/start",
  // Optional async (text: string) => Promise<string> for AI-enhanced descriptions.
  // Falls back to enhanceLocally() if not provided.
  enhanceFn,
  onStarted,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState(featureDescription);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reset/seed the form every time the modal transitions from closed to open.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(defaultPipelineName(appSlug));
      setDescription(featureDescription || "");
      setFile(null);
      setStatus(null);
      setResult(null);
      setLoading(false);
      setEnhancing(false);
    }
  }

  const isSubmitReady = Boolean(name.trim()) && Boolean(file);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleEnhance() {
    const draft = description.trim();
    if (!draft) {
      setStatus({ type: "error", message: "Enter a feature description before using AI Enhance." });
      return;
    }
    setEnhancing(true);
    setStatus({ type: "info", message: "Enhancing feature description…" });
    try {
      const enhanced = enhanceFn ? await enhanceFn(draft) : enhanceLocally(draft);
      setDescription(enhanced);
      setStatus({ type: "success", message: "Feature description enhanced. Review and edit before submitting." });
    } catch (err) {
      setStatus({ type: "error", message: `Could not enhance description: ${err.message}` });
    } finally {
      setEnhancing(false);
    }
  }

  // POST multipart/form-data { prd_file, pipeline_name } to your backend.
  // Expected JSON response: { name, task_id, tracking_link, ... }
  async function startAutomationPipeline(prdFile, pipelineName) {
    const form = new FormData();
    form.append("prd_file", prdFile);
    form.append("pipeline_name", pipelineName);

    const response = await fetch(endpoint, { method: "POST", body: form });
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
    if (!response.ok) {
      throw new Error(data.detail || data.error || `Failed to start pipeline (HTTP ${response.status})`);
    }
    return data;
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus({ type: "error", message: "Enter a pipeline name before submitting." });
      return;
    }
    if (!file) {
      setStatus({ type: "error", message: "Upload a requirement document (PRD) to start the pipeline." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Uploading requirement document and starting the pipeline…" });

    try {
      const pipeline = await startAutomationPipeline(file, trimmedName);

      setResult({
        name: pipeline.name || trimmedName,
        taskId: pipeline.task_id || "",
        trackingLink: pipeline.tracking_link || "",
      });
      setStatus(null);

      if (pipeline.tracking_link) {
        window.open(pipeline.tracking_link, "_blank", "noopener,noreferrer");
      }
      onStarted?.(pipeline);
    } catch (err) {
      setStatus({ type: "error", message: `⚠️ Could not start the pipeline: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    file,
    setFile,
    handleFileChange,
    handleEnhance,
    handleSubmit,
    isSubmitReady,
    status,
    result,
    loading,
    enhancing,
  };
}
