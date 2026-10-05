import { usersRepository } from "../users.repository";

export async function listUsersUsecase(params: {
  keywords?: string;
  role?: string;
  page?: number;
  perPage?: number;
}) {
  const result = await usersRepository.findMany(params);
  return {
    ...result,
    items: result.items.map(({ password, ...u }) => u),
  };
}
