import { adminRepository } from "../../repository/admin_repository";

export async function getAdminStatsUsecase() {
  return adminRepository.getStats();
}
