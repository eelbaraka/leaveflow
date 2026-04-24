import type { LeaveRequest, LeaveBalance } from "../types";
import { employees } from "./employees";
import { leaveTypes } from "./leave-types";

// A healthy mix of past, current, pending, upcoming requests
export const leaveRequests: LeaveRequest[] = [
  // Pending — need manager attention
  {
    id: "r1",
    employeeId: "e2",
    typeId: "lt1",
    startDate: "2026-05-04",
    endDate: "2026-05-08",
    days: 5,
    reason: "Family trip to Kyoto",
    status: "pending",
    approverId: "e1",
    requestedAt: "2026-04-20T10:12:00Z",
  },
  {
    id: "r2",
    employeeId: "e3",
    typeId: "lt1",
    startDate: "2026-05-04",
    endDate: "2026-05-06",
    days: 3,
    reason: "Cousin's wedding",
    status: "pending",
    approverId: "e1",
    requestedAt: "2026-04-21T14:03:00Z",
  },
  {
    id: "r3",
    employeeId: "e4",
    typeId: "lt3",
    startDate: "2026-04-28",
    endDate: "2026-04-30",
    days: 3,
    reason: "Focused deep-work week",
    status: "pending",
    approverId: "e1",
    requestedAt: "2026-04-22T08:45:00Z",
  },
  {
    id: "r4",
    employeeId: "e6",
    typeId: "lt1",
    startDate: "2026-06-15",
    endDate: "2026-06-26",
    days: 10,
    reason: "Summer holiday — Portugal",
    status: "pending",
    approverId: "e5",
    requestedAt: "2026-04-18T16:22:00Z",
  },
  {
    id: "r5",
    employeeId: "e9",
    typeId: "lt4",
    startDate: "2026-04-27",
    endDate: "2026-04-29",
    days: 3,
    reason: "Family bereavement",
    status: "pending",
    approverId: "e8",
    requestedAt: "2026-04-23T07:10:00Z",
  },

  // Approved — upcoming
  {
    id: "r6",
    employeeId: "e1",
    typeId: "lt1",
    startDate: "2026-05-11",
    endDate: "2026-05-15",
    days: 5,
    reason: "Long-overdue hiking trip",
    status: "approved",
    approverId: "e11",
    requestedAt: "2026-04-01T09:00:00Z",
    decidedAt: "2026-04-02T11:00:00Z",
  },
  {
    id: "r7",
    employeeId: "e7",
    typeId: "lt1",
    startDate: "2026-05-05",
    endDate: "2026-05-07",
    days: 3,
    reason: "City break",
    status: "approved",
    approverId: "e5",
    requestedAt: "2026-04-10T12:00:00Z",
    decidedAt: "2026-04-11T09:12:00Z",
  },
  {
    id: "r8",
    employeeId: "e10",
    typeId: "lt3",
    startDate: "2026-04-27",
    endDate: "2026-04-27",
    days: 1,
    reason: "Home repairs",
    status: "approved",
    approverId: "e8",
    requestedAt: "2026-04-19T10:00:00Z",
    decidedAt: "2026-04-19T14:00:00Z",
  },
  {
    id: "r9",
    employeeId: "e12",
    typeId: "lt1",
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    days: 5,
    reason: "Wedding in Marrakech",
    status: "approved",
    approverId: "e11",
    requestedAt: "2026-04-05T11:20:00Z",
    decidedAt: "2026-04-06T09:30:00Z",
  },
  {
    id: "r10",
    employeeId: "e14",
    typeId: "lt1",
    startDate: "2026-05-11",
    endDate: "2026-05-13",
    days: 3,
    reason: "Vacation",
    status: "approved",
    approverId: "e13",
    requestedAt: "2026-04-12T15:00:00Z",
    decidedAt: "2026-04-13T10:00:00Z",
  },

  // Approved — past (used days)
  {
    id: "r11",
    employeeId: "e2",
    typeId: "lt2",
    startDate: "2026-03-10",
    endDate: "2026-03-11",
    days: 2,
    reason: "Flu",
    status: "approved",
    approverId: "e1",
    requestedAt: "2026-03-10T08:00:00Z",
    decidedAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "r12",
    employeeId: "e3",
    typeId: "lt1",
    startDate: "2026-02-23",
    endDate: "2026-02-27",
    days: 5,
    reason: "Spring break",
    status: "approved",
    approverId: "e1",
    requestedAt: "2026-02-01T10:00:00Z",
    decidedAt: "2026-02-02T09:00:00Z",
  },
  {
    id: "r13",
    employeeId: "e6",
    typeId: "lt3",
    startDate: "2026-03-16",
    endDate: "2026-03-20",
    days: 5,
    reason: "Off-site week",
    status: "approved",
    approverId: "e5",
    requestedAt: "2026-03-01T10:00:00Z",
    decidedAt: "2026-03-02T09:00:00Z",
  },
  {
    id: "r14",
    employeeId: "e8",
    typeId: "lt1",
    startDate: "2026-01-19",
    endDate: "2026-01-23",
    days: 5,
    reason: "Winter holiday",
    status: "approved",
    approverId: "e11",
    requestedAt: "2026-01-02T10:00:00Z",
    decidedAt: "2026-01-03T09:00:00Z",
  },

  // Rejected
  {
    id: "r15",
    employeeId: "e4",
    typeId: "lt1",
    startDate: "2026-05-12",
    endDate: "2026-05-13",
    days: 2,
    reason: "Short break",
    status: "rejected",
    approverId: "e1",
    requestedAt: "2026-04-15T10:00:00Z",
    decidedAt: "2026-04-16T09:00:00Z",
    note: "Conflicts with product launch week.",
  },
];

// Computed balances (for year 2026)
function calcBalances(): LeaveBalance[] {
  const balances: LeaveBalance[] = [];
  const year = 2026;
  employees.forEach((emp) => {
    leaveTypes.forEach((t) => {
      const used = leaveRequests
        .filter((r) => r.employeeId === emp.id && r.typeId === t.id && r.status === "approved")
        .reduce((s, r) => s + r.days, 0);
      const pending = leaveRequests
        .filter((r) => r.employeeId === emp.id && r.typeId === t.id && r.status === "pending")
        .reduce((s, r) => s + r.days, 0);
      balances.push({
        employeeId: emp.id,
        typeId: t.id,
        year,
        allowance: t.defaultAllowanceDays,
        accrued: t.defaultAllowanceDays,
        used,
        pending,
      });
    });
  });
  return balances;
}

export const leaveBalances = calcBalances();

export const balanceFor = (employeeId: string, typeId: string) =>
  leaveBalances.find((b) => b.employeeId === employeeId && b.typeId === typeId);
