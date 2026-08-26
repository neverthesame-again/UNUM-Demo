// ProjectForm Component - Add/Edit project form

import { useState, useEffect } from "react";

export const ProjectForm = ({
  project,
  workspaces,
  projects = [],
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    workspace_id: "",
    title: "",
    description: "",
    type: "Greenfield",
    due_date: "",
    members_count: 0,
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing project
  useEffect(() => {
    if (project) {
      setFormData({
        workspace_id: project.workspace_id || "",
        title: project.title || "",
        description: project.description || "",
        type: project.type || "Greenfield",
        due_date: project.due_date || "",
        members_count: project.members_count || 0,
        display_order: project.display_order || 999,
      });
    }
  }, [project]);

  // Surface duplicate-title errors from the backend (e.g. a race with
  // another admin adding the same project between load and submit).
  useEffect(() => {
    if (submitError?.field) {
      setErrors((prev) => ({
        ...prev,
        [submitError.field]: submitError.message,
      }));
    }
  }, [submitError]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "number" ? parseInt(value, 10) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.workspace_id) {
      newErrors.workspace_id = "Workspace is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    } else if (
      formData.workspace_id &&
      projects.some(
        (p) =>
          (!project || p.id !== project.id) &&
          p.workspace_id === formData.workspace_id &&
          p.title?.trim().toLowerCase() === formData.title.trim().toLowerCase()
      )
    ) {
      newErrors.title = "A project with this title already exists in this workspace";
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
          <label htmlFor="workspace_id" className="form-label">
            Workspace *
          </label>
          <select
            id="workspace_id"
            name="workspace_id"
            className={`form-select ${errors.workspace_id ? "error" : ""}`}
            value={formData.workspace_id}
            onChange={handleChange}
          >
            <option value="">Select a workspace</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name} ({workspace.domains?.name})
              </option>
            ))}
          </select>
          {errors.workspace_id && (
            <span className="form-error">{errors.workspace_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Type *
          </label>
          <select
            id="type"
            name="type"
            className="form-select"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Greenfield">Greenfield</option>
            <option value="Brownfield">Brownfield</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Project Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? "error" : ""}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Prior Authorization Automation"
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
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
          placeholder="Describe this project..."
          rows={3}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      {/* Progress & Status info */}
      <div className="form-group">
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0', lineHeight: 1.6 }}>
          📊 <strong>Progress</strong> and <strong>Status</strong> are auto-computed from project phases.
          Add phases in Settings → Project Details after creating this project.
        </p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="due_date" className="form-label">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            className="form-input"
            value={formData.due_date}
            onChange={handleChange}
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

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {project ? "Update Project" : "Add Project"}
        </button>
      </div>
    </form>
  );
};
