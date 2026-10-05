import { adminRepository } from "../admin.repository";

export async function getAdminModulesUsecase(cefrFilter?: string) {
  return adminRepository.getAllModules(cefrFilter);
}
