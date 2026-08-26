// Repository File Type Constants
// Defines the allowed file types for project repository cards
// and their badge label/colors shown on the Repository tab

export const REPOSITORY_FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "DOC" },
  { value: "docx", label: "DOCX" },
  { value: "md", label: "MD" },
];

const FILE_TYPE_STYLES = {
  pdf: { label: "PDF", background: "rgba(239, 68, 68, 0.18)", color: "#ff6b6b" },
  doc: { label: "DOC", background: "rgba(59, 130, 246, 0.18)", color: "#5b9dff" },
  docx: { label: "DOC", background: "rgba(59, 130, 246, 0.18)", color: "#5b9dff" },
  md: { label: "MD", background: "rgba(20, 184, 166, 0.18)", color: "#2dd4bf" },
};

export const getFileTypeStyle = (fileType) =>
  FILE_TYPE_STYLES[fileType] || FILE_TYPE_STYLES.pdf;

// Appends the file type extension to the display name if not already present
export const getDisplayFileName = (fileName, fileType) => {
  if (!fileName) return fileName;
  const extension = `.${fileType}`;
  if (fileName.toLowerCase().endsWith(extension.toLowerCase())) {
    return fileName;
  }
  return `${fileName}${extension}`;
};
