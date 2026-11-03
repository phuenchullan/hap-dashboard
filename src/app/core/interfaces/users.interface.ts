export interface UserPermission {
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface UserRow {
  id: string;
  rut: number;
  dv: string;
  name: string;
  lastname: string;
  email: string;
  role: 'superadmin' | 'admin' | 'supervisor' | 'viewer' | 'supervisor_harvest';
  isActive: boolean;
  password?: string;
  permissions?: UserPermission[];
}

export type UpdateUser = Partial<
  Pick<UserRow, 'rut' | 'dv' | 'name' | 'lastname' | 'email' | 'role' | 'isActive'>
>;
