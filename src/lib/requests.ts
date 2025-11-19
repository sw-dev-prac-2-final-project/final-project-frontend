export type RequestAction = "add" | "reduce" | "new";
export type RequestStatus = "Approved" | "Pending" | "Rejected";

export type RequestRecord = {
  id: string;
  requestName: string;
  requestId: string;
  action: RequestAction;
  amount: number;
  requester: string;
  status: RequestStatus;
};

export const REQUEST_ACTION_LABELS: Record<RequestAction, string> = {
  reduce: "Reduce Stock",
  add: "Add Stock",
  new: "Add New Item",
};

export const REQUESTS_DATA: RequestRecord[] = [
  {
    id: "r-1",
    requestName: "Augmentin 625 Duo",
    requestId: "22",
    action: "reduce",
    amount: 5,
    requester: "Spade",
    status: "Approved",
  },
  {
    id: "r-2",
    requestName: "Azithral 500 Tablet",
    requestId: "08",
    action: "add",
    amount: 19,
    requester: "Teamangkorn",
    status: "Pending",
  },
  {
    id: "r-3",
    requestName: "Azithral 50 Tyrenol",
    requestId: "101",
    action: "new",
    amount: 10,
    requester: "Nadeem",
    status: "Rejected",
  },
];
