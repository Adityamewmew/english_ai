import { adminRepository } from "../admin.repository";
import { NotFoundError } from "../../../core/errors/app-error";

export async function getAdminModuleDetailUsecase(id: string) {
  const result = await adminRepository.getModuleDetailWithSections(id);
  if (!result) {
    throw new NotFoundError("Modul tidak ditemukan");
  }
  return result;
}
