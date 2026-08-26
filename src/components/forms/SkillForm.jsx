// SkillForm Component - Add/Edit skill form

import { useState, useEffect } from "react";

export const SkillForm = ({
  skill,
  domains,
  skills = [],
  submitError,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    domain_id: "",
    title: "",
    description: "",
    emoji: "🎯",
    category: "",
    display_order: 999,
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing existing skill
  useEffect(() => {
    if (skill) {
      setFormData({
        domain_id: skill.domain_id || "",
        title: skill.title || "",
        description: skill.description || "",
        emoji: skill.emoji || "🎯",
        category: skill.category || "",
        display_order: skill.display_order || 999,
      });
    }
  }, [skill]);

  // Surface duplicate-title errors from the backend (e.g. a race with
  // another admin adding the same skill between load and submit).
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
      newErrors.title = "Skill title is required";
    } else if (
      formData.domain_id &&
      skills.some(
        (s) =>
          (!skill || s.id !== skill.id) &&
          s.domain_id === formData.domain_id &&
          s.title?.trim().toLowerCase() === formData.title.trim().toLowerCase()
      )
    ) {
      newErrors.title = "A skill with this title already exists in this domain";
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

  // Common emojis for skills
  const commonEmojis = [
    "🎯",
    "🧪",
    "🔍",
    "📝",
    "🔄",
    "🛡️",
    "⚡",
    "📊",
    "🚀",
    "💡",
    "🔧",
    "📈",
    "🎨",
    "🔐",
    "🌐",
    "💻",
    "📱",
    "🎓",
    "🏆",
    "⭐",
    "🔥",
    "✨",
    "💪",
    "🎪",
  ];

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
            placeholder="e.g., Testing, Security"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Skill Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? "error" : ""}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Unit Testing"
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
          placeholder="Describe this skill..."
          rows={3}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="emoji" className="form-label">
          Emoji
        </label>
        <input
          type="text"
          id="emoji"
          name="emoji"
          className="form-input"
          value={formData.emoji}
          onChange={handleChange}
          placeholder="🎯"
          maxLength={2}
        />
        <div className="color-presets" style={{ marginTop: "8px" }}>
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="color-preset"
              style={{
                background: "rgba(var(--white-rgb), 0.05)",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setFormData((prev) => ({ ...prev, emoji: emoji }))}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
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
          {skill ? "Update Skill" : "Add Skill"}
        </button>
      </div>
    </form>
  );
};
