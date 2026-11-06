export const DEPARTMENTS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CHEM",
  "AIDS",
  "AIML",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS: Record<Department, string> = {
  CSE: "Computer Science & Engineering",
  IT: "Information Technology",
  ECE: "Electronics & Communication",
  EEE: "Electrical & Electronics",
  MECH: "Mechanical Engineering",
  CIVIL: "Civil Engineering",
  CHEM: "Chemical Engineering",
  AIDS: "AI & Data Science",
  AIML: "AI & Machine Learning",
};

export const YEARS = [1, 2, 3, 4] as const;

export const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};
