export interface UserPermission {
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface UserRow {
  id: string;
  rut: string | number;
  dv: string;
  name: string;
  lastname: string;
  email: string;
  role: 'superadmin' | 'admin' | 'supervisor' | 'viewer' | 'supervisor_harvest';
  isActive?: boolean;
  activeLand?: string | null;
  password?: string;
}

export type CreateUser = Omit<UserRow, 'id'> & {
  password: string;
};

export type UpdateUser = Partial<
  Pick<UserRow, 'rut' | 'dv' | 'name' | 'lastname' | 'email' | 'role' | 'isActive' | 'activeLand'>
>;
