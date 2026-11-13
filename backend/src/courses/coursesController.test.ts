import type { Request, Response } from 'express';
import { getCourseController, getCourseGroupsController, searchCoursesController } from './coursesController.js';
import { getCourseGroupsService, getCourseService, getsearchCoursesService } from './courseService.js';

vi.mock('./courseService.js');

function createReqRes(params: Record<string, string> = {}, query: Record<string, string> = {}) {
  return {
    req: { params, query } as unknown as Request,
    res: { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('searchCoursesController', () => {
  it('returns 400 when name is blank', async () => {
    const { req, res } = createReqRes({}, { name: '  ' });

    await searchCoursesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Parametr name jest wymagany' });
    expect(getsearchCoursesService).not.toHaveBeenCalled();
  });

  it.each(['-1', '1.5', 'abc'])('returns 400 for page %s', async (page) => {
    const { req, res } = createReqRes({}, { name: 'analiza', page });

    await searchCoursesController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nieprawidłowy numer strony' });
    expect(getsearchCoursesService).not.toHaveBeenCalled();
  });

  it('passes the trimmed name and page 0 by default', async () => {
    const { req, res } = createReqRes({}, { name: ' analiza ' });
    const result = { courses: [], nextPage: false };
    vi.mocked(getsearchCoursesService).mockResolvedValue(result);

    await searchCoursesController(req, res);

    expect(getsearchCoursesService).toHaveBeenCalledWith('analiza', 0);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('parses the page number', async () => {
    const { req, res } = createReqRes({}, { name: 'analiza', page: '2' });
    vi.mocked(getsearchCoursesService).mockResolvedValue({ courses: [], nextPage: false });

    await searchCoursesController(req, res);

    expect(getsearchCoursesService).toHaveBeenCalledWith('analiza', 2);
  });
});

describe('getCourseGroupsController', () => {
  it('returns 400 when courseId is blank', async () => {
    const { req, res } = createReqRes({ courseId: '  ' });

    await getCourseGroupsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getCourseGroupsService).not.toHaveBeenCalled();
  });

  it('returns 200 with groups', async () => {
    const { req, res } = createReqRes({ courseId: 'COURSE-1' });
    const groups = [{ id: '10-1', unitId: '10', groupNumber: 1, classType: 'Wykład', lecturers: [] }];
    vi.mocked(getCourseGroupsService).mockResolvedValue(groups);

    await getCourseGroupsController(req, res);

    expect(getCourseGroupsService).toHaveBeenCalledWith('COURSE-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(groups);
  });

  it('returns 500 when service throws', async () => {
    const { req, res } = createReqRes({ courseId: 'COURSE-1' });
    vi.mocked(getCourseGroupsService).mockRejectedValue(new Error('usos down'));

    await getCourseGroupsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getCourseController', () => {
  it('returns 400 when courseId is blank', async () => {
    const { req, res } = createReqRes({ courseId: '  ' });

    await getCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getCourseService).not.toHaveBeenCalled();
  });

  it('returns 200 with the course', async () => {
    const { req, res } = createReqRes({ courseId: 'COURSE-1' });
    const course = { id: 'COURSE-1', name: 'Analiza matematyczna' };
    vi.mocked(getCourseService).mockResolvedValue(course);

    await getCourseController(req, res);

    expect(getCourseService).toHaveBeenCalledWith('COURSE-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(course);
  });

  it('returns 404 when the course does not exist', async () => {
    const { req, res } = createReqRes({ courseId: 'NOPE' });
    vi.mocked(getCourseService).mockResolvedValue(null);

    await getCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when service throws', async () => {
    const { req, res } = createReqRes({ courseId: 'COURSE-1' });
    vi.mocked(getCourseService).mockRejectedValue(new Error('usos down'));

    await getCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
