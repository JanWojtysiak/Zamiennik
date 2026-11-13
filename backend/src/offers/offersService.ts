import { Prisma } from "../../generated/client.js";
import { prisma } from "../lib/prisma.js";
import type { OfferCategory } from "./offerCategory.js";

interface Offer {
  userId: string;
  offeredCourseId: string;
  wantedCourseId: string;
  offeredGroupId: string;
  wantedGroupId: string;
  category: OfferCategory;
}

const offerInclude = {
  createdBy: {
    select: { id: true, name: true, firstName: true, lastName: true, image: true, email: true },
  },
} as const;

type OfferWithAuthor = Prisma.OfferGetPayload<{ include: typeof offerInclude }>;

function studentIndexFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  return /^\d+$/.test(localPart) ? localPart : null;
}

function toPublicOffer(offer: OfferWithAuthor) {
  const { email, ...author } = offer.createdBy;
  return {
    ...offer,
    createdBy: { ...author, studentIndex: studentIndexFromEmail(email) },
  };
}

//GETs

export async function getAllOffersService(category?: OfferCategory) {
  const offers = await prisma.offer.findMany({
    where: category ? { category } : {},
    include: offerInclude,
    orderBy: { createdAt: "desc" },
  });
  return offers.map(toPublicOffer);
}

export async function getMineOffersService(
  userId: string,
  category?: OfferCategory,
) {
  const offers = await prisma.offer.findMany({
    where: {
      createdById: userId,
      ...(category && { category }),
    },
    include: offerInclude,
    orderBy: { createdAt: "desc" },
  });
  return offers.map(toPublicOffer);
}

export async function getOfferByIdService(id: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: offerInclude,
  });
  return offer && toPublicOffer(offer);
}

//POSTs

export async function postOfferService(offer: Offer) {
  const title = `Wymiana ${offer.offeredCourseId} na ${offer.wantedCourseId}`;
  const created = await prisma.offer.create({
    data: {
      title,
      offeredCourseId: offer.offeredCourseId,
      wantedCourseId: offer.wantedCourseId,
      offeredGroupId: offer.offeredGroupId,
      wantedGroupId: offer.wantedGroupId,
      category: offer.category,
      createdById: offer.userId,
    },
    include: offerInclude,
  });
  return toPublicOffer(created);
}

//DELETEs

export async function deleteOfferService(id: string, userId: string) {
  try {
    await prisma.offer.delete({ where: { id, createdById: userId } });
    return true;
  } catch (error) {
    // P2025: nie ma takiego ogłoszenia albo należy do kogoś innego.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return false;
    }
    throw error;
  }
}