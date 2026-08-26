// VideoForm Component - Add/Edit video form

import { useState, useEffect } from "react";

export const VideoForm = ({
  video,
  domains,
  videos = [],
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    domain_id: "",
    title: "",
    description: "",
    video_url: "",
    prototype_url: "",
    status: "active",
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing video
  useEffect(() => {
    if (video) {
      setFormData({
        domain_id: video.domain_id || "",
        title: video.title || "",
        description: video.description || "",
        video_url: video.video_url || "",
        prototype_url: video.prototype_url || "",
        status: video.status || "active",
        display_order: video.display_order || 999,
      });
    }
  }, [video]);

  // Surface duplicate-title errors from the backend (e.g. a race with
  // another admin adding the same video/card between load and submit).
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

    if (!formData.domain_id) {
      newErrors.domain_id = "Domain is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (
      formData.domain_id &&
      videos.some(
        (v) =>
          (!video || v.id !== video.id) &&
          v.domain_id === formData.domain_id &&
          v.title?.trim().toLowerCase() === formData.title.trim().toLowerCase()
      )
    ) {
      newErrors.title = "A video/card with this title already exists in this domain";
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
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? "error" : ""}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Automating Code Reviews with AI"
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
          rows={3}
          placeholder="Brief description of the video or demo..."
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="video_url" className="form-label">
            Video URL
          </label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            className={`form-input ${errors.video_url ? "error" : ""}`}
            value={formData.video_url}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=... or Vimeo URL"
          />
          <small style={{ fontSize: "11px", color: "var(--muted)" }}>
            YouTube, Vimeo, or direct video file URL
          </small>
          {errors.video_url && (
            <span className="form-error">{errors.video_url}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="prototype_url" className="form-label">
            Prototype URL
          </label>
          <input
            type="url"
            id="prototype_url"
            name="prototype_url"
            className={`form-input ${errors.prototype_url ? "error" : ""}`}
            value={formData.prototype_url}
            onChange={handleChange}
            placeholder="https://your-prototype-url.com"
          />
          <small style={{ fontSize: "11px", color: "var(--muted)" }}>
            Link to interactive prototype or demo
          </small>
          {errors.prototype_url && (
            <span className="form-error">{errors.prototype_url}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
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
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {video ? "Update Card" : "Add Card"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
