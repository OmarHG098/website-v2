// Border radius values used by the table wrapper and its corners
export const BORDER_RADIUS = {
  TABLE: "6px", // Applied to the outer table container
  HEADER: "6px 6px 0 0", // Top-left & top-right radius for header row
  FOOTER: "0 0 6px 6px", // Bottom-left & bottom-right radius for last row
};

// Re-usable border definitions to keep styling consistent
export const BORDER_STYLES = {
  DEFAULT: "1px solid #e0e0e0",
  HEADER: "1px solid #e0e0e0",
  CELL: "1px solid #e0e0e0",
};

// Palette used across table elements for quick theming
export const COLORS = {
  HEADER_BG: "#f5f5f5", // Background for header row
  STRIPE_BG: "#f8f9fa", // Zebra-stripe background for alternating rows
  WHITE: "#ffffff", // Default cell background
  BORDER: "#e0e0e0", // Divider & outline color
  HOVER_BG: "#f9f9f9", // Background on row hover (if implemented)
};

// Padding presets to maintain consistent spacing
export const PADDING = {
  CELL: "12px 8px", // Default cell padding
  HEADER: "12px 8px", // Header cell padding
  MEDIUM: "14px", // Shared medium padding for buttons or other elements
};

// Typography constants to keep text styles uniform
export const TYPOGRAPHY = {
  FONT_SIZE: "15px", // Base font size for body text
  HEADER_FONT_WEIGHT: "bold", // Weight for header labels
  CELL_FONT_WEIGHT: "normal", // Weight for body content
  FONT_FAMILY: "Lato", // Primary font family
  FONT_SIZES: {
    SMALL: "14px", // Smaller text for dense tables
  },
};
