import { Platform } from "react-native";

export const BrandColors = {
  primaryCoral: "#E8845F",
  primaryDark: "#8B4D3B",
  primaryLight: "#F5D6C6",
  highlightYellow: "#FFD93D",
  white: "#FFFFFF",
  darkText: "#4A3728",
  lightBackground: "#FAF0E8",
  cream: "#F5E6DC",
  warmOrange: "#E8A87C",
  warmOrangeDark: "#C27C59",
  warmPeach: "#F5D6C6",
  warmBrown: "#8B5A3C",
  warmCream: "#FDF0E6",
  primaryBlue: "#E8845F",
};

export const Colors = {
  light: {
    text: BrandColors.darkText,
    buttonText: BrandColors.white,
    tabIconDefault: "#8B7B6B",
    tabIconSelected: BrandColors.primaryCoral,
    link: BrandColors.primaryCoral,
    accent: BrandColors.highlightYellow,
    backgroundRoot: BrandColors.cream,
    backgroundDefault: BrandColors.lightBackground,
    backgroundSecondary: "#F0E0D5",
    backgroundTertiary: "#E8D4C5",
  },
  dark: {
    text: "#ECEDEE",
    buttonText: BrandColors.white,
    tabIconDefault: "#9BA1A6",
    tabIconSelected: BrandColors.primaryCoral,
    link: BrandColors.primaryCoral,
    accent: BrandColors.highlightYellow,
    backgroundRoot: "#2A2420",
    backgroundDefault: "#3A3028",
    backgroundSecondary: "#4A4038",
    backgroundTertiary: "#5A5048",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
