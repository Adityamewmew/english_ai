import { adminRepository } from "../admin.repository";

export async function getAdminStatsUsecase() {
  return adminRepository.getStats();
}
