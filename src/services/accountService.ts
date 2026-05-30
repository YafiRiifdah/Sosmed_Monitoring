import { prisma } from "../database/prisma.js";

type AccountInput = {
  username?: string;
  displayName?: string | null;
  kontingen?: string | null;
  isActive?: boolean;
};

export const accountService = {
  listMonitored: () => prisma.monitoredAccount.findMany({ orderBy: [{ kontingen: "asc" }, { username: "asc" }] }),
  createMonitored: (data: Required<Pick<AccountInput, "username">> & AccountInput) =>
    prisma.monitoredAccount.create({ data }),
  updateMonitored: (id: string, data: AccountInput) => prisma.monitoredAccount.update({ where: { id }, data }),
  removeMonitored: (id: string) => prisma.monitoredAccount.delete({ where: { id } }),
  bulkUpsertMonitored: (accounts: Array<Required<Pick<AccountInput, "username">> & AccountInput>) =>
    prisma.$transaction(
      accounts.map((account) =>
        prisma.monitoredAccount.upsert({
          where: { username: account.username },
          update: {
            displayName: account.displayName,
            kontingen: account.kontingen,
            isActive: account.isActive ?? true
          },
          create: {
            username: account.username,
            displayName: account.displayName,
            kontingen: account.kontingen,
            isActive: account.isActive ?? true
          }
        })
      )
    ),

  listTargets: () => prisma.targetAccount.findMany({ orderBy: { createdAt: "desc" } }),
  createTarget: (data: Required<Pick<AccountInput, "username">> & AccountInput) => prisma.targetAccount.create({ data }),
  updateTarget: (id: string, data: AccountInput) => prisma.targetAccount.update({ where: { id }, data }),
  removeTarget: (id: string) => prisma.targetAccount.delete({ where: { id } })
};
