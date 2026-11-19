// 🟡 P-054: admin e gestor caem no dashboard da organização; respondente, ou
// ninguém logado (login desligado), no individual.
export function dashboardPath(role: string | null | undefined): string {
  return role === 'admin' || role === 'gestor'
    ? '/dashboard/company'
    : '/dashboard';
}
