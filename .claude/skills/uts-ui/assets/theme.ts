// Plantilla de tokens. Fuente de verdad: docs/Design.md. Mantener sincronizado.

export const colors = {
  light: {
    primary: '#34531F',
    primaryHover: '#132F20',
    accent: '#C3D730', // Nunca como texto o ícono sobre fondos claros
    secondary: '#4E7A2F', // Enlaces
    neutral: '#575756',
    background: '#FFFFFF',
    screen: '#F2F4EF', // Fondo de pantallas de lista y dashboard
    card: '#FFFFFF',
    surface: '#F2F4EF', // Inputs dentro de tarjetas, chips inactivos
    surfaceWarm: '#F8E9D4',
    textPrimary: '#132F20',
    textSecondary: '#575756',
    border: '#E5E5E5',
    success: '#2BA640', // Solo ícono o relleno
    warning: '#FB8C00', // Solo ícono o relleno
    error: '#B3261E',
    errorPressed: '#6D100A',
    onPrimary: '#FFFFFF',
    onAccent: '#132F20',
    // Campos de texto. Sobre el fondo `screen`, usar `inputFillOnScreen`.
    inputFill: '#F2F4EF',
    inputFillOnScreen: '#FFFFFF',
    inputBorder: '#C9D0C3', // Tenue a propósito (~1.6:1). Contraste estricto 3:1: '#8C968A'
    inputBorderFocus: '#4E7A2F',
    placeholder: '#767676',
  },
  dark: {
    primary: '#C3D730',
    primaryHover: '#C3D730',
    accent: '#C3D730',
    secondary: '#C3D730',
    neutral: '#B3B3B3',
    background: '#0B1710',
    screen: '#0B1710',
    card: '#132F20',
    surface: '#132F20',
    surfaceWarm: '#132F20',
    textPrimary: '#F2F4EF',
    textSecondary: '#B3B3B3',
    border: 'rgba(255,255,255,0.08)',
    success: '#2BA640',
    warning: '#FB8C00',
    error: '#B3261E',
    errorPressed: '#6D100A',
    onPrimary: '#132F20',
    onAccent: '#132F20',
    inputFill: '#0B1710',
    inputFillOnScreen: '#132F20',
    inputBorder: 'rgba(255,255,255,0.16)',
    inputBorderFocus: '#C3D730',
    placeholder: '#B3B3B3',
  },
} as const;

// Degradado de marca (expo-linear-gradient). Siempre con texto blanco.
export const gradients = {
  brand: { colors: ['#34531F', '#132F20'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;

export const chartColors = {
  series1: '#34531F',
  comparison: '#878787',
  highlight: '#C3D730', // Con borde de 1px #34531F sobre fondo claro
  negative: '#6D100A',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, huge: 64 } as const;
// Entre botones apilados: spacing.lg (16). Entre botones lado a lado: spacing.md (12).

export const radius = {
  tooltip: 4,
  badge: 8,
  input: 12,
  card: 16,
  hero: 20,
  sheet: 24,
  header: 32,
  pill: 9999,
} as const;

export const touchTarget = 48;
export const inputHeight = 52;
export const buttonHeight = { default: 52, compact: 44 } as const;
export const iconSize = { inline: 16, button: 20, nav: 24, empty: 40 } as const;

// Sombras teñidas de verde profundo. En Android mapear a `elevation`.
export const shadows = {
  level1: { shadowColor: '#132F20', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  level2: { shadowColor: '#132F20', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  level3: { shadowColor: '#132F20', shadowOpacity: 0.18, shadowRadius: 48, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
} as const;

// Movimiento (react-native-reanimated). Respetar "reducir movimiento".
export const motion = {
  duration: { press: 150, standard: 250, sheet: 350 },
  easing: [0.2, 0, 0, 1] as const, // cubic-bezier
  spring: { damping: 20, stiffness: 200 },
  pressScale: { button: 0.97, card: 0.98 },
  stagger: 40, // ms entre ítems; máximo 8 ítems
  shimmer: 1200,
} as const;

// Fuentes. Único lugar donde aparecen nombres de fuente: ningún componente los escribe.
// En React Native cada peso es un archivo distinto; no usar `fontWeight` con fuentes propias.
// Cargar con useFonts() y mantener el splash hasta que carguen (archivos en mobile/assets/fonts/).
export const fonts = {
  // Corporativa (requiere los archivos y una licencia que cubra apps móviles)
  regular: 'MyriadPro-Regular',
  semibold: 'MyriadPro-Semibold',
  bold: 'MyriadPro-Bold',
  mono: 'SourceCodePro_400Regular', // @expo-google-fonts/source-code-pro
  // Respaldo mientras llegan los archivos: Source Sans 3 (@expo-google-fonts/source-sans-3)
  //   regular: 'SourceSans3_400Regular',
  //   semibold: 'SourceSans3_600SemiBold',
  //   bold: 'SourceSans3_700Bold',
  // (verificar los nombres exactos al instalar el paquete)
} as const;

// Myriad Pro es más estrecha y de menor altura x que Roboto: tamaños +1 px.
// El antiguo peso medio (500) ahora es Semibold.
export const typography = {
  screenTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 26 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  metricNumber: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  metadata: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  button: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  code: { fontFamily: fonts.mono, fontSize: 14, lineHeight: 20 },
} as const;

export type ThemeMode = keyof typeof colors;
