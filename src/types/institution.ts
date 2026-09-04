export type InstitutionType = "school" | "college";

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  location: string;
  website: string;
  logo?: string;
  emailDomain?: string; // e.g. "@futurecollege.ac.in" for colleges
  studentIdPrefix?: string; // e.g. "SCH2026" for schools
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

export interface Student {
  id: string;
  institutionId: string;
  name: string;
  email?: string;
  studentId?: string;
  department?: string; // CSE, ECE, IT, etc. for colleges
  class?: string; // Grade 9, 10, 11, 12 for schools
  year?: string; // 1st, 2nd, 3rd, 4th
  section: string; // A, B, C
  rollNumber: string;
  status: "active" | "pending" | "inactive";
  joinedDate: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  email: string;
  department: string;
  role: string; // Professor, Assistant Professor, HOD, Dean, Teacher
  status: "active" | "invited" | "inactive";
  joinedDate: string;
}

export interface Group {
  id: string;
  institutionId: string;
  name: string;
  department?: string;
  year?: string;
  section?: string;
  studentCount: number;
  description?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  institutionId: string;
  title: string;
  content: string;
  targetGroup: string;
  deadline?: string;
  date: string;
  status: "published" | "draft" | "scheduled";
  recipientsCount: number;
  category?: "Academic" | "Scholarship" | "Event" | "Administrative";
}
