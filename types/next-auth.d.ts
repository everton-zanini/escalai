import { DefaultSession } from "@auth/core/types";

export interface DepartmentRoleClaim {
  departmentId: number;
  departmentName: string;
  role: "LIDER" | "MEMBRO";
}

declare module "@auth/core/types" {
  interface User {
    id: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
    departmentRoles: DepartmentRoleClaim[];
  }

  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      mustChangePassword: boolean;
      departmentRoles: DepartmentRoleClaim[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    mustChangePassword: boolean;
    departmentRoles: DepartmentRoleClaim[];
  }
}
