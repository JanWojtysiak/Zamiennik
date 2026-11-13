// Shape of a group as returned by GET /api/courses/:courseId/groups.
export interface CourseGroup {
  id: string;
  unitId: string;
  groupNumber: number;
  classType: string;
  lecturers: string[];
}

export interface CourseInfo {
  id: string;
  name: string;
}

export async function fetchCourse(courseId: string) {
  const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`status ${response.status}`);
  }

  return (await response.json()) as CourseInfo;
}

export async function fetchCourseGroups(courseId: string) {
  const response = await fetch(
    `/api/courses/${encodeURIComponent(courseId)}/groups`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(`status ${response.status}`);
  }

  return (await response.json()) as CourseGroup[];
}

export function groupLabel(group: CourseGroup) {
  return `${group.classType} gr. ${group.groupNumber}`;
}
