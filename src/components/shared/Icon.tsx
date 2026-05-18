import {
  Archive,
  Award,
  Calendar,
  Check,
  Droplets,
  Globe,
  HelpCircle,
  Leaf,
  Pause,
  Play,
  Plus,
  Scissors,
  Skull,
  Sprout,
  Star,
  Timer,
  TreePine,
  X,
  Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  scissors: Scissors,
  timer: Timer,
  calendar: Calendar,
  leaf: Leaf,
  tree: TreePine,
  plus: Plus,
  x: X,
  check: Check,
  help: HelpCircle,
  globe: Globe,
  zap: Zap,
  skull: Skull,
  sprout: Sprout,
  award: Award,
  archive: Archive,
  play: Play,
  pause: Pause,
  star: Star,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = '#fff' }: IconProps) {
  const Comp = ICONS[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} strokeWidth={2} />;
}
