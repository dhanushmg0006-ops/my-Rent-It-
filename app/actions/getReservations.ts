import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams) {
  const { listingId, userId, authorId } = params;

  const query: any = {};
  if (listingId) query.listingId = listingId;
  if (userId) query.userId = userId;
  if (authorId) query.listing = { userId: authorId };

  const reservations = await prisma.reservation.findMany({
    where: query,
    orderBy: { createdAt: "desc" },
  });

  if (reservations.length === 0) {
    return [];
  }

  const listingIds = Array.from(new Set(reservations.map((r) => r.listingId).filter(Boolean)));
  const userIds = Array.from(new Set(reservations.map((r) => r.userId).filter(Boolean)));
  const reservationIds = reservations.map((r) => r.id);

  const [listings, users, payments] = await Promise.all([
    prisma.listing.findMany({ where: { id: { in: listingIds } } }),
    prisma.user.findMany({ where: { id: { in: userIds } } }),
    prisma.payment.findMany({ where: { reservationId: { in: reservationIds } } }),
  ]);

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const userMap = new Map(users.map((u) => [u.id, u]));
  const paymentMap = payments.reduce<Record<string, typeof payments[0][]>>((acc, payment) => {
    if (!payment.reservationId) {
      console.warn(`Payment ${payment.id} missing reservationId. Skipping.`);
      return acc;
    }

    if (!acc[payment.reservationId]) acc[payment.reservationId] = [];
    acc[payment.reservationId]!.push(payment);
    return acc;
  }, {});

  return reservations
    .map((res) => {
      const listing = listingMap.get(res.listingId);
      const user = userMap.get(res.userId);

      if (!listing) {
        console.warn(`Reservation ${res.id} references missing listing ${res.listingId}. Skipping.`);
        return null;
      }

      if (!user) {
        console.warn(`Reservation ${res.id} references missing user ${res.userId}. Skipping.`);
        return null;
      }

      return {
        ...res,
        createdAt: res.createdAt.toISOString(),
        startDate: res.startDate.toISOString(),
        endDate: res.endDate.toISOString(),
        listing: {
          ...listing,
          createdAt: listing.createdAt.toISOString(),
        },
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: user.isVerified || null,
        },
        payments: (paymentMap[res.id] || []).map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        })),
      };
    })
    .filter((res): res is NonNullable<typeof res> => res !== null);
}
