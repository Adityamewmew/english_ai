import { adminRepository } from "../../repository/admin_repository";
import { NotFoundError } from "../../../common/errors/app-error";

export async function getAdminModuleDetailUsecase(id: string) {
  const result = await adminRepository.getModuleDetailWithSections(id);
  if (!result) {
    throw new NotFoundError("Modul tidak ditemukan");
  }
  return result;
}
