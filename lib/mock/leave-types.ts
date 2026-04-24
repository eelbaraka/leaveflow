import type { LeaveType } from "../types";

export const leaveTypes: LeaveType[] = [
  {
    id: "lt1",
    name: "Paid Time Off",
    code: "PTO",
    color: "#d98618", // ochre-500
    defaultAllowanceDays: 25,
    accrualPerMonth: 2.08,
    requiresApproval: true,
    paid: true,
  },
  {
    id: "lt2",
    name: "Sick Leave",
    code: "SICK",
    color: "#c2433a",
    defaultAllowanceDays: 10,
    accrualPerMonth: 0.83,
    requiresApproval: false,
    paid: true,
  },
  {
    id: "lt3",
    name: "Work From Home",
    code: "WFH",
    color: "#677854", // sage-500
    defaultAllowanceDays: 52,
    accrualPerMonth: 4.33,
    requiresApproval: true,
    paid: true,
  },
  {
    id: "lt4",
    name: "Bereavement",
    code: "BRV",
    color: "#56606b",
    defaultAllowanceDays: 5,
    accrualPerMonth: 0,
    requiresApproval: true,
    paid: true,
  },
  {
    id: "lt5",
    name: "Parental",
    code: "PAR",
    color: "#8a6fb3",
    defaultAllowanceDays: 90,
    accrualPerMonth: 0,
    requiresApproval: true,
    paid: true,
  },
  {
    id: "lt6",
    name: "Unpaid Leave",
    code: "UNP",
    color: "#888175",
    defaultAllowanceDays: 30,
    accrualPerMonth: 0,
    requiresApproval: true,
    paid: false,
  },
];

export const leaveTypeById = (id: string) => leaveTypes.find((t) => t.id === id);
