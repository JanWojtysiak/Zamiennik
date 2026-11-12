import { prisma } from "../lib/prisma.js";
import type { OfferCategory } from "../../generated/enums.js";

interface Offer {
  userId: string;
  offeredCourseId: string;
  wantedCourseId: string;
  offeredGroupId: string;
  wantedGroupId: string;
  category: OfferCategory;
}

// Author data loaded with an offer. The email is only used to derive the
// student index and is stripped before the offer leaves this module.
const offerInclude = {
  createdBy: {
    select: { id: true, name: true, firstName: true, lastName: true, image: true, email: true },
  },
} as const;

// PWr student emails look like "284154@student.pwr.edu.pl"; the local part is the index.
function studentIndexFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  return /^\d+$/.test(localPart) ? localPart : null;
}

type PublicAuthor<A> = Omit<A, "email"> & { studentIndex: string | null };

function toPublicOffer<T extends { createdBy: { email: string } }>(
  offer: T,
): Omit<T, "createdBy"> & { createdBy: PublicAuthor<T["createdBy"]> } {
  const { email, ...author } = offer.createdBy;
  const createdBy = {
    ...(author as Omit<T["createdBy"], "email">),
    studentIndex: studentIndexFromEmail(email),
  };
  return { ...offer, createdBy };
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
