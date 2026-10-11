import { userRepository } from "../../repository/user_repository";

export async function listUsersUsecase(params: {
  keywords?: string;
  role?: string;
  page?: number;
  perPage?: number;
}) {
  const result = await userRepository.findMany(params);
  return {
    ...result,
    items: result.items.map(({ password, ...u }: any) => u),
  };
}
