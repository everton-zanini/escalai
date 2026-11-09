// Usuários que um admin pode gerir: só da própria igreja e, exceto para super-admin,
// nunca outro super-admin (evita que admin de igreja redefina a senha do dono do app).
export function manageableUsersWhere(admin: { churchId: number; isSuperAdmin: boolean }) {
  return {
    churchId: admin.churchId,
    ...(admin.isSuperAdmin ? {} : { isSuperAdmin: false }),
  };
}
