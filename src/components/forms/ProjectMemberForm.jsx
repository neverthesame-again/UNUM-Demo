// ProjectMemberForm Component - Add/Edit project member form

import { useState, useEffect } from "react";

export const ProjectMemberForm = ({
  member,
  projects,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    project_id: "",
    name: "",
    role: "",
    avatar_color: "#6366f1",
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing member
  useEffect(() => {
    if (member) {
      setFormData({
        project_id: member.project_id || "",
        name: member.name || "",
        role: member.role || "",
        avatar_color: member.avatar_color || "#6366f1",
        display_order: member.display_order || 999,
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "number" ? parseInt(value, 10) || 0 : value;

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

    if (!formData.name.trim()) {
      newErrors.name = "Member name is required";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
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

  // Preview avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColorOptions = [
    { label: "Purple", value: "#6366f1" },
    { label: "Green", value: "#10b981" },
    { label: "Cyan", value: "#06b6d4" },
    { label: "Orange", value: "#f59e0b" },
    { label: "Pink", value: "#ec4899" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Red", value: "#ef4444" },
    { label: "Teal", value: "#14b8a6" },
    { label: "Indigo", value: "#4f46e5" },
    { label: "Amber", value: "#d97706" },
  ];

  return (
    <form className="domain-form" onSubmit={handleSubmit}>
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Member Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? "error" : ""}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Maria Lopez"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Role *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            className={`form-input ${errors.role ? "error" : ""}`}
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Care Manager"
          />
          {errors.role && <span className="form-error">{errors.role}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Avatar Color</label>
        <div className="pd-color-picker">
          {avatarColorOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pd-color-swatch ${formData.avatar_color === opt.value ? "active" : ""}`}
              style={{ background: opt.value }}
              onClick={() =>
                setFormData((prev) => ({ ...prev, avatar_color: opt.value }))
              }
              title={opt.label}
            />
          ))}
        </div>
        {/* Avatar preview */}
        {formData.name && (
          <div className="pd-avatar-preview">
            <div
              className="pd-preview-circle"
              style={{ background: formData.avatar_color }}
            >
              {getInitials(formData.name)}
            </div>
            <span className="pd-preview-label">Preview</span>
          </div>
        )}
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
          {member ? "Update Member" : "Add Member"}
        </button>
      </div>
    </form>
  );
};
