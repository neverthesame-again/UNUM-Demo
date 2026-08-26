// ProjectPhaseForm Component - Add/Edit project phase form

import { useState, useEffect } from "react";

export const ProjectPhaseForm = ({ phase, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    subtitle: "",
    description: "",
    icon_emoji: "🔒",
    progress: 0,
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing phase
  useEffect(() => {
    if (phase) {
      setFormData({
        project_id: phase.project_id || "",
        title: phase.title || "",
        subtitle: phase.subtitle || "",
        description: phase.description || "",
        icon_emoji: phase.icon_emoji || "🔒",
        progress: phase.progress || 0,
        display_order: phase.display_order || 999,
      });
    }
  }, [phase]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue;
    if (type === "checkbox") {
      finalValue = checked;
    } else if (type === "number") {
      finalValue = parseInt(value, 10) || 0;
    } else {
      finalValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.project_id) {
      newErrors.project_id = "Project is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Phase title is required";
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
          <label htmlFor="project_id" className="form-label">
            Project *
          </label>
          <select
            id="project_id"
            name="project_id"
            className={`form-select ${errors.project_id ? "error" : ""}`}
            value={formData.project_id}
            onChange={handleChange}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} ({project.workspaces?.name || "Unknown"})
              </option>
            ))}
          </select>
          {errors.project_id && (
            <span className="form-error">{errors.project_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="icon_emoji" className="form-label">
            Icon Emoji
          </label>
          <input
            type="text"
            id="icon_emoji"
            name="icon_emoji"
            className="form-input"
            value={formData.icon_emoji}
            onChange={handleChange}
            placeholder="🔒"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Phase Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? "error" : ""}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Discovery & Impact Analysis"
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="subtitle" className="form-label">
          Subtitle
        </label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          className="form-input"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="e.g., Requirements and change impact"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe this phase..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="progress" className="form-label">
            Progress (%)
          </label>
          <input
            type="number"
            id="progress"
            name="progress"
            className="form-input"
            value={formData.progress}
            onChange={handleChange}
            min="0"
            max="100"
          />
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
      </div>

      {/* Current phase info */}
      <div className="form-group">
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0', lineHeight: 1.6 }}>
          📋 <strong>Current Phase</strong> is auto-determined: the first phase (by display order) with progress below 100%.
        </p>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {phase ? "Update Phase" : "Add Phase"}
        </button>
      </div>
    </form>
  );
};
