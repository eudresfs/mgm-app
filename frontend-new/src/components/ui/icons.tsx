import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Facebook,
  BarChart3,
  Users,
  Calendar,
  Edit,
  Copy,
  Filter,
  Search,
  LogOut,
  Bell,
  Home,
  LayoutDashboard,
  LineChart,
  PieChart,
  DollarSign,
  Percent,
  Tag,
  Link,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Key,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  settings: Settings,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
  facebook: Facebook,
  twitter: Twitter,
  page: File,
  media: Image,
  text: FileText,
  check: Check,
  warning: AlertCircle,
  card: CreditCard,
  copy: Copy,
  plus: Plus,
  more: MoreVertical,
  edit: Edit,
  chart: BarChart3,
  users: Users,
  calendar: Calendar,
  filter: Filter,
  search: Search,
  logout: LogOut,
  notification: Bell,
  home: Home,
  dashboard: LayoutDashboard,
  lineChart: LineChart,
  pieChart: PieChart,
  dollar: DollarSign,
  percent: Percent,
  tag: Tag,
  link: Link,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  smartphone: Smartphone,
  key: Key,
  shieldCheck: ShieldCheck,
  shieldAlert: ShieldAlert,
  refresh: RefreshCw,
};