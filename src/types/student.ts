export type StudentAccessType = "COLLEGE_EMAIL" | "SCHOOL_STUDENT_ID";

export interface StudentProfile {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: "college" | "school";
  type?: "college" | "school"; // alias
  name: string;
  email?: string;
  studentId?: string;
  department?: string; // CSE, IT, ECE for college
  className?: string; // Class 10, 11, 12 for school
  class?: string; // alias
  year?: string; // 1st Year, 2nd Year for college
  section: string; // A, B, C
  rollNumber: string;
  status: "active" | "pending" | "inactive";
  accessType: StudentAccessType;
  
  // Student Personal Preferences (Editable by student)
  interests: string[];
  preferredStartTime: string; // e.g. "6 PM"
  preferredEndTime: string; // e.g. "10 PM"
  availableDailyHours: string; // e.g. "2 hours"
  onboardingCompleted: boolean;
  joinedDate: string;
}

export interface StudentAccessRecord {
  studentId: string;
  institutionId: string;
  accessType: StudentAccessType;
  verified: boolean;
  verifiedAt: string;
}
