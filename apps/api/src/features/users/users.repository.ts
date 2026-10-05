import { db } from "../../db";
import { users } from "./users.schema";
import { eq, isNull, and, like, desc, sql } from "drizzle-orm";

export const usersRepository = {
  findById: async (id: string) => {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return user || null;
  },

  findByEmail: async (email: string) => {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    return user || null;
  },

  findMany: async (params: {
    keywords?: string;
    role?: string;
    page?: number;
    perPage?: number;
  }) => {
    const page = params.page || 1;
    const perPage = params.perPage || 10;
    const offset = (page - 1) * perPage;

    let query = db.select().from(users).where(isNull(users.deletedAt)).$dynamic();

    if (params.keywords) {
      query = query.where(like(users.name, `%${params.keywords}%`));
    }
    if (params.role) {
      query = query.where(eq(users.role, params.role));
    }

    const items = await query.orderBy(desc(users.createdAt)).limit(perPage).offset(offset);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(users)
      .where(isNull(users.deletedAt));

    return {
      items,
      total: Number(total),
      page,
      perPage,
      totalPages: Math.ceil(Number(total) / perPage),
    };
  },

  create: async (data: typeof users.$inferInsert) => {
    const [created] = await db.insert(users).values(data).returning();
    return created;
  },

  update: async (id: string, data: Partial<typeof users.$inferInsert>) => {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated || null;
  },

  softDelete: async (id: string, deletedBy: string) => {
    const [deleted] = await db
      .update(users)
      .set({ deletedAt: new Date(), deletedBy })
      .where(eq(users.id, id))
      .returning();
    return deleted || null;
  },
};
