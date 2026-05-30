export type Colors = {
  /** Verde scuro Trenord */
  primary: string;
  /** Verde più scuro per hover/active */
  primaryContainer: string;
  /** Sfondo pagina */
  surface: string;
  /** Sfondo delle card grigio chiaro */
  surfaceVariant: string;
  /** Testo principale */
  onSurface: string;
  /** Testo secondario/descrizioni */
  onSurfaceVariant: string;
  /** Bordi */
  outline: string;
  /** Rosso per bottone Report */
  error: string;
  /** Sfondo trasparente per la bottom nav bar */
  surface70: string;
  /** Bordi trasparenti per la bottom nav bar */
  outlineVariant20: string;
};

export type Sizes = {
  /** Small spacing (px) */
  sm: number;
  /** Medium spacing (px) */
  md: number;
  /** Large spacing (px) */
  lg: number;
  /** Extra large spacing (px) */
  xl: number;
};

export type Typography = {
  /** usato solo per la bottom nav bar */
  fontSize: number;
  lineHeight: number;
  /** 0.05em di 12px */
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
