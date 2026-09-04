export type UserRole = "student" | "institution" | "faculty";

export type StudentAuthMode = "college" | "school";

export interface WorkflowStep {
  step: number;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
}

export interface FeatureItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
}

export interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  badge: string;
  highlights: string[];
}
