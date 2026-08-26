// WorkspaceForm Component - Add/Edit workspace form

import { useState, useEffect } from "react";
import { WORKSPACE_GRADIENTS } from "../../constants/domain-colors";

export const WorkspaceForm = ({
  workspace,
  domains,
  workspaces = [],
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    domain_id: "",
    workspace_key: "",
    name: "",
    description: "",
    category: "",
    app_badge: "",
    badge_color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    projects_count: 0,
    members_count: 0,
    display_order: 999,
    include_l3_pipeline: false,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing workspace
  useEffect(() => {
    if (workspace) {
      setFormData({
        domain_id: workspace.domain_id || "",
        workspace_key: workspace.workspace_key || "",
        name: workspace.name || "",
        description: workspace.description || "",
        category: workspace.category || "",
        app_badge: workspace.app_badge || "",
        badge_color:
          workspace.badge_color || "linear-gradient(135deg, #6366f1, #8b5cf6)",
        projects_count: workspace.projects_count || 0,
        members_count: workspace.members_count || 0,
        display_order: workspace.display_order || 999,
        include_l3_pipeline: workspace.include_l3_pipeline || false,
      });
    }
  }, [workspace]);

  // Surface duplicate-key/name errors from the backend (e.g. a race with
  // another admin adding the same workspace between load and submit).
  useEffect(() => {
    if (submitError?.field) {
      setErrors((prev) => ({
        ...prev,
        [submitError.field]: submitError.message,
      }));
    }
  }, [submitError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue =
      type === "number"
        ? parseInt(value, 10) || 0
        : type === "checkbox"
        ? checked
        : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Auto-generate workspace_key from name if adding new workspace
    if (name === "name" && !workspace) {
      const autoKey = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, workspace_key: autoKey }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.domain_id) {
      newErrors.domain_id = "Domain is required";
    }

    const otherWorkspaces = workspaces.filter(
      (w) => !workspace || w.id !== workspace.id
    );

    if (!formData.name.trim()) {
      newErrors.name = "Workspace name is required";
    } else if (
      otherWorkspaces.some(
        (w) => w.name?.trim().toLowerCase() === formData.name.trim().toLowerCase()
      )
    ) {
      newErrors.name = "A workspace with this name already exists";
    }

    if (!formData.workspace_key.trim()) {
      newErrors.workspace_key = "Workspace key is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.workspace_key)) {
      newErrors.workspace_key =
        "Key can only contain lowercase letters, numbers, and hyphens";
    } else if (
      otherWorkspaces.some(
        (w) =>
          w.workspace_key?.trim().toLowerCase() ===
          formData.workspace_key.trim().toLowerCase()
      )
    ) {
      newErrors.workspace_key = "A workspace with this key already exists";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="domain-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="domain_id" className="form-label">
            Domain *
          </label>
          <select
            id="domain_id"
            name="domain_id"
            className={`form-select ${errors.domain_id ? "error" : ""}`}
            value={formData.domain_id}
            onChange={handleChange}
          >
            <option value="">Select a domain</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
          {errors.domain_id && (
            <span className="form-error">{errors.domain_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="workspace_key" className="form-label">
            Workspace Key *
          </label>
          <input
            type="text"
            id="workspace_key"
            name="workspace_key"
            className={`form-input ${errors.workspace_key ? "error" : ""}`}
            value={formData.workspace_key}
            onChange={handleChange}
            placeholder="e.g., project-apollo"
          />
          {errors.workspace_key && (
            <span className="form-error">{errors.workspace_key}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Workspace Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={`form-input ${errors.name ? "error" : ""}`}
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Project Apollo"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          className={`form-textarea ${errors.description ? "error" : ""}`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe this workspace..."
          rows={3}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            className="form-input"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Development, Design"
          />
        </div>

        <div className="form-group">
          <label htmlFor="app_badge" className="form-label">
            App Badge
          </label>
          <input
            type="text"
            id="app_badge"
            name="app_badge"
            className="form-input"
            value={formData.app_badge}
            onChange={handleChange}
            placeholder="e.g., React, Node.js"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="badge_color" className="form-label">
          Badge Gradient Color
        </label>
        <input
          type="text"
          className="form-input"
          value={formData.badge_color}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              badge_color: e.target.value,
            }))
          }
          placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)"
        />
        <div className="gradient-presets">
          {WORKSPACE_GRADIENTS.map((gradient, index) => (
            <button
              key={index}
              type="button"
              className="gradient-preset"
              style={{ background: gradient }}
              onClick={() =>
                setFormData((prev) => ({ ...prev, badge_color: gradient }))
              }
              title={gradient}
            />
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="display_order" className="form-label">
            Display Order
          </label>
          <input
            type="number"
            id="display_order"
            name="display_order"
            className="form-input"
            value={formData.display_order}
            onChange={handleChange}
            min="1"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="projects_count" className="form-label">
            Projects Count
          </label>
          <input
            type="number"
            id="projects_count"
            name="projects_count"
            className="form-input"
            value={formData.projects_count}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="members_count" className="form-label">
            Members Count
          </label>
          <input
            type="number"
            id="members_count"
            name="members_count"
            className="form-input"
            value={formData.members_count}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label
          className="form-checkbox-label"
          data-tooltip="Enable L3 Autonomous Pipeline integration for this workspace"
        >
          <input
            type="checkbox"
            name="include_l3_pipeline"
            checked={formData.include_l3_pipeline}
            onChange={handleChange}
          />
          Include L3 Autonomous Pipeline
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {workspace ? "Update Workspace" : "Add Workspace"}
        </button>
      </div>
    </form>
  );
};
