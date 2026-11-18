// Plantilla de patrón de marca (hojas, plumas y libros).
// Copiar a mobile/src/components/BrandPattern.tsx.
// Fuente de verdad: docs/Design.md, sección "Brand pattern".
//
// IMPORTANTE:
// - Los íconos se declaran en el registro único src/icons/ con nombre LITERAL
//   (react-native-iconify no acepta nombres desde variables). Aquí se asume que el
//   registro exporta LeafIcon, FeatherIcon y BookIcon con las props { size, color }.
//   Nombres Iconify sugeridos (verificar en icones.js.org):
//   mdi:leaf, mdi:feather, mdi:book-open-page-variant
// - Adaptar las props a la API vigente de la librería.
// - Estático. Fundido de entrada de 350 ms; sin animación si "reducir movimiento" está activo.

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { LeafIcon, FeatherIcon, BookIcon } from '../icons';

type Kind = 'leaf' | 'feather' | 'book';
type Placement = {
  x: number; // % del ancho (centro del ícono)
  y: number; // % del alto
  size: number; // px
  rotate: number; // grados
  kind: Kind;
  opacity: number;
  tone?: 'white' | 'lime';
};

// Lista fija y determinista. La zona central (x 28-72 %, y 25-70 %) queda libre para logo y título.
export const HEADER_PLACEMENTS: Placement[] = [
  { x: 8, y: 12, size: 56, rotate: -20, kind: 'leaf', opacity: 0.1 },
  { x: 84, y: 10, size: 44, rotate: 18, kind: 'feather', opacity: 0.16, tone: 'lime' },
  { x: 20, y: 34, size: 36, rotate: 12, kind: 'book', opacity: 0.09 },
  { x: 92, y: 38, size: 60, rotate: -14, kind: 'leaf', opacity: 0.09 },
  { x: 6, y: 58, size: 48, rotate: 24, kind: 'feather', opacity: 0.1 },
  { x: 78, y: 62, size: 40, rotate: -26, kind: 'book', opacity: 0.11 },
  { x: 24, y: 82, size: 64, rotate: 10, kind: 'book', opacity: 0.14, tone: 'lime' },
  { x: 58, y: 88, size: 36, rotate: -18, kind: 'leaf', opacity: 0.12 },
  { x: 92, y: 84, size: 52, rotate: 20, kind: 'feather', opacity: 0.09 },
  { x: 42, y: 8, size: 30, rotate: 28, kind: 'leaf', opacity: 0.08 },
  { x: 66, y: 14, size: 34, rotate: -10, kind: 'book', opacity: 0.1 },
  { x: 12, y: 92, size: 34, rotate: -24, kind: 'feather', opacity: 0.1 },
  { x: 50, y: 96, size: 44, rotate: 14, kind: 'book', opacity: 0.08 },
  { x: 96, y: 58, size: 32, rotate: 30, kind: 'leaf', opacity: 0.16, tone: 'lime' },
];

// Para tarjetas destacadas: 3 íconos al 10 % en la esquina inferior derecha.
export const HERO_PLACEMENTS: Placement[] = [
  { x: 92, y: 80, size: 56, rotate: -16, kind: 'leaf', opacity: 0.1 },
  { x: 76, y: 94, size: 40, rotate: 20, kind: 'feather', opacity: 0.1 },
  { x: 98, y: 50, size: 36, rotate: 12, kind: 'book', opacity: 0.1 },
];

const ICONS = { leaf: LeafIcon, feather: FeatherIcon, book: BookIcon } as const;

type Props = {
  placements?: Placement[];
  dark?: boolean; // en modo oscuro el blanco baja al 6 %
};

function BrandPatternBase({ placements = HEADER_PLACEMENTS, dark = false }: Props) {
  const reduceMotion = useReducedMotion();
  const entering = reduceMotion ? undefined : FadeIn.duration(350);

  return (
    <Animated.View
      entering={entering}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {placements.map((p, i) => {
        const Icon = ICONS[p.kind];
        const lime = p.tone === 'lime';
        const color = lime ? '#C3D730' : '#FFFFFF';
        const opacity = !lime && dark ? Math.min(p.opacity, 0.06) : p.opacity;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              opacity,
              transform: [{ rotate: `${p.rotate}deg` }],
            }}
          >
            <Icon size={p.size} color={color} />
          </View>
        );
      })}
    </Animated.View>
  );
}

export const BrandPattern = memo(BrandPatternBase);
