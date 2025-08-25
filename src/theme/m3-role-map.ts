// Reads your canonical tokens and exposes Material-3-style roles.
// Robust: works even if designs/design-updated.json temporarily lacks an `m3` block.

import design from "../../designs/design-updated.json";

type ColorRolesLight = {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;
  outline: string;
  surfaceContainer?: string;
  surfaceContainerLow?: string;
  surfaceContainerHigh?: string;
  surfaceContainerHighest?: string;
};

type Design = {
  m3?: {
    colorRoles?: { light?: Partial<ColorRolesLight> };
    typeRoles?: Record<string, unknown>;
    elevation?: Record<string, { surfaceRole: string; shadow: string }>;
  };
  colors: {
    primary: Record<string, string>;
    neutral: Record<string, string>;
    background: { primary: string; card: string; hover?: string };
    text: { primary: string; inverse: string };
    border: { medium: string };
  };
  typography: {
    hierarchy: {
      h1: Record<string, string>;
      h2: Record<string, string>;
      h3: Record<string, string>;
      h4: Record<string, string>;
      body: Record<string, string>;
      caption: Record<string, string>;
      small: Record<string, string>;
    };
  };
} & Record<string, unknown>;

const FallbackColorRolesLight: ColorRolesLight = {
  primary: (design as Design).colors.primary["600"] ?? "#dc2bff",
  onPrimary: (design as Design).colors.text.inverse,
  surface: (design as Design).colors.background.primary,
  onSurface: (design as Design).colors.text.primary,
  outline: (design as Design).colors.border.medium,
  surfaceContainer: (design as Design).colors.background.card,
  surfaceContainerLow: (design as Design).colors.background.primary,
  surfaceContainerHigh:
    (design as any).colors.background.hover ??
    (design as Design).colors.neutral?.["100"] ??
    "#f3f4f6",
  surfaceContainerHighest:
    (design as Design).colors.neutral?.["100"] ?? "#f3f4f6"
};

const FallbackTypeRoles = {
  display: {
    large: { ref: "typography.hierarchy.h1" },
    medium: { ref: "typography.hierarchy.h2" },
    small: { ref: "typography.hierarchy.h3" }
  },
  headline: {
    large: { ref: "typography.hierarchy.h2" },
    medium: { ref: "typography.hierarchy.h3" },
    small: { ref: "typography.hierarchy.h4" }
  },
  title: {
    large: { ref: "typography.hierarchy.h3" },
    medium: { ref: "typography.hierarchy.h4" },
    small: { fontSize: "0.875rem", fontWeight: "600", lineHeight: "1.375" }
  },
  body: {
    large: { ref: "typography.hierarchy.body" },
    medium: { ref: "typography.hierarchy.caption" },
    small: { ref: "typography.hierarchy.small" }
  },
  label: {
    large: { fontSize: "0.875rem", fontWeight: "600", lineHeight: "1.25" },
    medium: { fontSize: "0.75rem", fontWeight: "600", lineHeight: "1.25" },
    small: { fontSize: "0.75rem", fontWeight: "500", lineHeight: "1.25" }
  }
};

const FallbackElevation = {
  level0: { surfaceRole: "surface", shadow: "none" },
  level1: { surfaceRole: "surfaceContainerLow", shadow: "0 1px 2px 0 rgba(0,0,0,0.05)" },
  level2: { surfaceRole: "surfaceContainer", shadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" },
  level3: { surfaceRole: "surfaceContainerHigh", shadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }
};

const d = design as Design;
const rolesLight: ColorRolesLight = { ...FallbackColorRolesLight, ...(d.m3?.colorRoles?.light ?? {}) };
const typeRoles = d.m3?.typeRoles ?? FallbackTypeRoles;
const elevation = d.m3?.elevation ?? FallbackElevation;

export const m3 = {
  color: {
    ...rolesLight,
    textOnPrimary: rolesLight.onPrimary,
    textOnSurface: rolesLight.onSurface,
    border: rolesLight.outline
  },
  type: typeRoles,
  elevation
} as const;
