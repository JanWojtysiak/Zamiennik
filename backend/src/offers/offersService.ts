import { prisma } from "../lib/prisma.js";

interface Offer {
  userId: string;
  offeredCourseId: string;
  wantedCourseId: string;
}

export async function postOfferService(offer: Offer) {
  const title = `Wymiana ${offer.offeredCourseId} na ${offer.wantedCourseId}`;
  return prisma.offer.create({
    data: {
      title,
      offeredCourseId: offer.offeredCourseId,
      wantedCourseId: offer.wantedCourseId,
      createdById: offer.userId,
    },
  });
}

export async function getMineOffersService(userId: string) {
  return prisma.offer.findMany({
    where: {
      createdById: userId,
    },
  });
}
