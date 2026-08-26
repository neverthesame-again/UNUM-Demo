// RepositoryFileForm Component - Add/Edit project repository file form

import { useState, useEffect } from "react";
import { REPOSITORY_FILE_TYPES } from "../../constants/repository-file-types";

export const RepositoryFileForm = ({ file, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_id: "",
    file_name: "",
    file_type: "pdf",
    file_url: "",
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing file
  useEffect(() => {
    if (file) {
      setFormData({
        project_id: file.project_id || "",
        file_name: file.file_name || "",
        file_type: file.file_type || "pdf",
        file_url: file.file_url || "",
        display_order: file.display_order || 999,
      });
    }
  }, [file]);

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

    if (!formData.file_name.trim()) {
      newErrors.file_name = "File name is required";
    }

    if (!formData.file_type) {
      newErrors.file_type = "File type is required";
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
          <label htmlFor="file_name" className="form-label">
            File Name *
          </label>
          <input
            type="text"
            id="file_name"
            name="file_name"
            className={`form-input ${errors.file_name ? "error" : ""}`}
            value={formData.file_name}
            onChange={handleChange}
            placeholder="e.g., Feature Brief.pdf"
          />
          {errors.file_name && (
            <span className="form-error">{errors.file_name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="file_type" className="form-label">
            File Type *
          </label>
          <select
            id="file_type"
            name="file_type"
            className={`form-select ${errors.file_type ? "error" : ""}`}
            value={formData.file_type}
            onChange={handleChange}
          >
            {REPOSITORY_FILE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.file_type && (
            <span className="form-error">{errors.file_type}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="file_url" className="form-label">
          File URL
        </label>
        <input
          type="text"
          id="file_url"
          name="file_url"
          className="form-input"
          value={formData.file_url}
          onChange={handleChange}
          placeholder="e.g., https://yourcompany.sharepoint.com/..."
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

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {file ? "Update Document" : "Add Document"}
        </button>
      </div>
    </form>
  );
};
