import { usosGet, UsosError } from "../lib/usosHelper.js";

interface LangDict {
  pl: string;
  en: string;
}

interface UsosCourseSearchResponse {
  items: {
    id: string;
    name: LangDict;
    is_currently_conducted: boolean;
  }[];
  next_page: boolean;
}

export interface CourseSearchResult {
  courses: { id: string; name: string }[];
  nextPage: boolean;
}

const PAGE_SIZE = 20;

export async function getsearchCoursesService(
  query: string,
  page = 0,
): Promise<CourseSearchResult> {
  const data = await usosGet<UsosCourseSearchResponse>("courses/search", {
    lang: "pl",
    name: query,
    fields: "id|name|is_currently_conducted",
    num: String(PAGE_SIZE),
    start: String(page * PAGE_SIZE),
  });

  const conducted = data.items.filter((course) => course.is_currently_conducted);

  const withGroups = await Promise.all(
    conducted.map(async (course) => ({
      course,
      hasGroups: (await getCourseGroupsService(course.id)).length > 0,
    })),
  );

  return {
    courses: withGroups
      .filter(({ hasGroups }) => hasGroups)
      .map(({ course }) => ({
        id: course.id,
        name: course.name.pl || course.name.en,
      })),
    nextPage: data.next_page,
  };
}

export interface CourseGroup {
  id: string;
  unitId: string;
  groupNumber: number;
  classType: string;
  lecturers: string[];
}

interface UsosCourseEditionResponse {
  course_units_ids: string[];
}

interface UsosUnitResponse {
  id: string;
  groups: {
    group_number: number;
    class_type: LangDict;
    lecturers: { first_name: string; last_name: string }[];
  }[];
}

export function getCurrentTermId(now = new Date()): string {
  const month = now.getMonth() + 1; // +1, bo liczmy od zera
  const year = now.getFullYear();

  const startYear = month >= 10 ? year : year - 1; // paz,lis,grudzien = obecny rok; styczen... poprzedni
  const endYearShort = String(startYear + 1).slice(-2); // rok akademicki konczy sie w kolejnym roku, np. 2026/27
  const isWinter = month >= 10 || month <= 2;

  return `${startYear}/${endYearShort}-${isWinter ? "Z" : "L"}`;
}

export async function getCourseGroupsService(
  courseId: string,
  termId = getCurrentTermId(),
): Promise<CourseGroup[]> {
  let unitIds: string[];

  try {
    const edition = await usosGet<UsosCourseEditionResponse>("courses/course_edition", {
      course_id: courseId,
      term_id: termId,
      fields: "course_units_ids",
    });
    unitIds = edition.course_units_ids;
  } catch (error) {
    if (error instanceof UsosError && error.status === 400) return [];
    throw error;
  }

  const units = await Promise.all(
    unitIds.map((unitId) =>
      usosGet<UsosUnitResponse>("courses/unit", {
        unit_id: unitId,
        fields: "id|groups[group_number|class_type|lecturers]",
      }),
    ),
  );

  return units.flatMap((unit) =>
    unit.groups.map((group) => ({
      id: `${unit.id}-${group.group_number}`,
      unitId: unit.id,
      groupNumber: group.group_number,
      classType: group.class_type.pl || group.class_type.en,
      lecturers: group.lecturers.map(
        (lecturer) => `${lecturer.first_name} ${lecturer.last_name}`,
      ),
    })),
  );
}