import { BookOpen, Building2, Gift, GraduationCap, HeartPulse, Landmark, Store, Truck } from 'lucide-react';
import type { Scenario } from '../domain/schema';

const ICONS = {
  bank: Landmark,
  landmark: Landmark,
  health: HeartPulse,
  building: Building2,
  gift: Gift,
  book: BookOpen,
  store: Store,
  truck: Truck,
  graduation: GraduationCap,
} as const;

export function BrandIcon({ icon, size = 26 }: { icon: NonNullable<Scenario['brand']>['icon']; size?: number }) {
  const Icon = ICONS[icon];
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}
