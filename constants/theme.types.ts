export type Colors = {
  /** Page background */
  background: string;
  /** Primary text */
  foreground: string;
  /** Brand primary color */
  primary: string;
  /** Text on the primary color */
  primaryForeground: string;
  /** Secondary color */
  secondary: string;
  /** Text on the secondary color */
  secondaryForeground: string;
  /** Background for inactive elements or cards */
  muted: string;
  /** Secondary text / descriptions */
  mutedForeground: string;
  /** Borders (e.g. outline) */
  border: string;
  /** Red for Report button or errors */
  destructive: string;
  /** Text on destructive/red color */
  destructiveForeground: string;
  /** Transparent background */
  backgroundTransparent: string;
  /** Transparent borders  */
  borderTransparent: string;
  /** Background color for on-time trains */
  homeSecondary: string;
  /** Text color for on Time/ Low Crowding*/
  info: string;
  /** Text color for on Time / Low Crowding */
  infoForeground: string;
  /** Background color for Normal Crowding */
  warning: string;
  /** Text color for Normal Crowding */
  warningForeground: string;
  /** Color for cloud icon in weather card */
  cloud: string;
};

export type Sizes = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type Typography = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: string;
};

export type Theme = {
  colors: Colors;
  spacing: Sizes;
  borderRadius: Sizes;
  typography: Typography;
};

export type GlobalTheme = {
  colors: {
    light: Colors;
    dark: Colors;
  };
  spacing: Sizes;
  borderRadius: Sizes;
  typography: Typography;
};

export type ColorName = keyof Colors;
