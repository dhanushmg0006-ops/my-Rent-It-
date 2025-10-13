import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getDeliveries() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const deliveries = await prisma.delivery.findMany({
      where: {
        address: {
          userId: currentUser.id,
        },
      },
      include: {
        reservation: {
          include: {
            listing: true, // 👈 to show product photo + details
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return deliveries;
  } catch (error: any) {
    console.error("Error fetching deliveries:", error);
    return [];
  }
}
