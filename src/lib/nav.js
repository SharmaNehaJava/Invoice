import {
  Calculator,
  CalendarDays,
  FileText,
  Percent,
  Sparkles,
  Truck,
  Settings,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "quote", label: "Quote", icon: Calculator },
  { id: "customers", label: "Customers", icon: Users },
  { id: "quotes", label: "Quotes", icon: FileText },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "stock", label: "Yard stock", icon: Truck },
  { id: "bulletins", label: "Bulletins", icon: Percent },
  { id: "ask", label: "Ask AI", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];
