import prisma from "../../config/prisma";

export const listMyNotifications = (userId: string) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { created_at: "desc" },
    take: 100,
  });

export const unreadCount = (userId: string) =>
  prisma.notification.count({ where: { userId, isRead: false } });

export const markRead = async (userId: string, id: string) => {
  // pastikan notifikasi ini milik user (ownership check)
  const notif = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notif) return null;
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });