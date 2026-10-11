import { adminRepository } from "../../repository/admin_repository";

export async function getAdminModulesUsecase(cefrFilter?: string) {
  return adminRepository.getAllModules(cefrFilter);
}
