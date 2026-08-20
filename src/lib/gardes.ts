import "server-only";
import { utilisateurActuel } from "@/lib/auth";
import {
  aPermission,
  RefusPermission,
  type ActionPerm,
  type ModulePerm,
} from "@/lib/permissions";
import type { Utilisateur } from "@/db/schema";

export async function exigerPermission(
  module: ModulePerm,
  action: ActionPerm,
): Promise<Utilisateur> {
  const compte = await utilisateurActuel();
  if (!compte) throw new Error("Session expirée. Reconnectez-vous.");
  if (!aPermission(compte.role, module, action, compte.superAdmin)) {
    throw new RefusPermission();
  }
  return compte;
}

export function peut(
  compte: { role: string; superAdmin?: boolean | null },
  module: ModulePerm,
  action: ActionPerm,
): boolean {
  return aPermission(compte.role, module, action, Boolean(compte.superAdmin));
}
