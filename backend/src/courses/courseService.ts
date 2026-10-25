import { usosGet } from "../lib/usosHelper.js";

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

  return {
    courses: data.items
      .filter((course) => course.is_currently_conducted)
      .map((course) => ({
        id: course.id,
        name: course.name.pl || course.name.en,
      })),
    nextPage: data.next_page,
  };
}

export async function getCourseGroupsService(courseId: string) {
}