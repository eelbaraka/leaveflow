export type Role = "admin" | "manager" | "employee";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  team: string;
  location: string; // country code for holidays
  managerId?: string;
  jobTitle: string;
  joinedAt: string; // ISO date
}

export interface LeaveType {
  id: string;
  name: string;
  color: string; // tailwind color token or hex
  code: string;
  defaultAllowanceDays: number;
  accrualPerMonth: number;
  requiresApproval: boolean;
  paid: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  typeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approverId?: string;
  requestedAt: string;
  decidedAt?: string;
  note?: string;
}

export interface LeaveBalance {
  employeeId: string;
  typeId: string;
  year: number;
  allowance: number;
  accrued: number;
  used: number;
  pending: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO date
  countryCode: string;
  countryName: string;
}

export interface Team {
  id: string;
  name: string;
  lead: string;
}
