import { adminRepository } from "../../repository/admin_repository";

export async function getAdminQuestionsUsecase(params: {
  cefr?: string;
  skill?: string;
  keywords?: string;
  page?: number;
  perPage?: number;
}) {
  return adminRepository.getAllQuestions(params);
}
