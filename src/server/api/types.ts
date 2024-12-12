import { SortingState } from "@tanstack/react-table";

export enum EStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
  ARCHIVED = "Archived",
}

export interface ITabGrid {
  id: string;
  name: string;
  current: boolean;
  href: string;
  default?: boolean;
  sorting?: SortingState;
}

export interface IGridFilterBy {
  id: string;
  type: "criteria" | "operator";
  field: string;
  operator: string;
  values: string[];
}

interface Account {
  contact: Contact;
  organization: Organization;
  organization_id: string;
}

interface Contact {
  id: string;
  categories: any[]; // Adjust type based on the expected array content
  code: string | null;
  tombstone: number;
  status: string;
  version: number;
  created_date: string;
  created_time: string;
  updated_date: string;
  updated_time: string;
  organization_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  requested_by: string | null;
  timestamp: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string | null;
}

interface Organization {
  id: string;
  categories: any[]; // Adjust type based on the expected array content
  code: string | null;
  tombstone: number;
  status: string;
  version: number;
  created_date: string;
  created_time: string;
  updated_date: string;
  updated_time: string;
  organization_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  requested_by: string | null;
  timestamp: string | null;
  parent_organization_id: string | null;
  name: string | null;
}

export interface TokenData {
  account: Account;
  iat: number;
  exp: number;
}
