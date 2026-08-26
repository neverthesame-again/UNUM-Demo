// DomainForm Component - Add/Edit domain form

import { useState, useEffect } from "react";
import { DOMAIN_COLORS, AVAILABLE_ICONS } from "../../constants/domain-colors";

export const DomainForm = ({
  domain,
  domains = [],
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    route: "",
    icon_name: "code",
    accent_color: "#1e6bff",
    badge_text: "",
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing domain
  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name || "",
        slug: domain.slug || "",
        description: domain.description || "",
        route: domain.route || "",
        icon_name: domain.icon_name || "code",
        accent_color: domain.accent_color || "#1e6bff",
        badge_text: domain.badge_text || "",
        display_order: domain.display_order || 999,
      });
    }
  }, [domain]);

  // Surface duplicate-slug/name errors from the backend (e.g. a race with
  // another admin adding the same domain between load and submit).
  useEffect(() => {
    if (submitError?.field) {
      setErrors((prev) => ({
        ...prev,
        [submitError.field]: submitError.message,
      }));
    }
  }, [submitError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from name if adding new domain
    if (name === "name" && !domain) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }

    // Auto-generate route from slug
    if (name === "slug") {
      setFormData((prev) => ({ ...prev, route: `/domains/${value}` }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const otherDomains = domains.filter((d) => !domain || d.id !== domain.id);

    if (!formData.name.trim()) {
      newErrors.name = "Domain name is required";
    } else if (
      otherDomains.some(
        (d) => d.name?.trim().toLowerCase() === formData.name.trim().toLowerCase()
      )
    ) {
      newErrors.name = "A domain with this name already exists";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (
      otherDomains.some(
        (d) => d.slug?.trim().toLowerCase() === formData.slug.trim().toLowerCase()
      )
    ) {
      newErrors.slug = "A domain with this slug already exists";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.badge_text.trim()) {
      newErrors.badge_text = "Badge text is required";
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
          <label htmlFor="name" className="form-label">
            Domain Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? "error" : ""}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Software Engineering"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="slug" className="form-label">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            className={`form-input ${errors.slug ? "error" : ""}`}
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g., swe"
          />
          {errors.slug && <span className="form-error">{errors.slug}</span>}
        </div>
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
          placeholder="Describe this domain..."
          rows={3}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="badge_text" className="form-label">
          Badge Text *
        </label>
        <input
          type="text"
          id="badge_text"
          name="badge_text"
          className={`form-input ${errors.badge_text ? "error" : ""}`}
          value={formData.badge_text}
          onChange={handleChange}
          placeholder="e.g., SWE - Innovate with AI"
        />
        {errors.badge_text && (
          <span className="form-error">{errors.badge_text}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="icon_name" className="form-label">
            Icon
          </label>
          <select
            id="icon_name"
            name="icon_name"
            className="form-select"
            value={formData.icon_name}
            onChange={handleChange}
          >
            {AVAILABLE_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="accent_color" className="form-label">
            Accent Color
          </label>
          <div className="color-picker-group">
            <input
              type="color"
              id="accent_color"
              name="accent_color"
              className="form-color-input"
              value={formData.accent_color}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-input"
              value={formData.accent_color}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accent_color: e.target.value,
                }))
              }
              placeholder="#1e6bff"
            />
          </div>
          <div className="color-presets">
            {DOMAIN_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                type="button"
                className="color-preset"
                style={{ background: color }}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, accent_color: color }))
                }
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="route" className="form-label">
            Route
          </label>
          <input
            type="text"
            id="route"
            name="route"
            className="form-input"
            value={formData.route}
            onChange={handleChange}
            placeholder="/domains/swe"
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

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {domain ? "Update Domain" : "Add Domain"}
        </button>
      </div>
    </form>
  );
};
