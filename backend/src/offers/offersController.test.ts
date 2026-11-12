import * as offersController from './offersController.js';
import { getSessionUserId } from '../auth/authService.js';
import type { Request, Response } from 'express';
import { getAllOffersService, getMineOffersService, getOfferByIdService, postOfferService } from './offersService.js';

vi.mock('../auth/authService.js');
vi.mock('./offersService.js');

function createReqRes(reqOverrides = {}) {
  return {
    req: { headers: {}, query: {}, ...reqOverrides } as unknown as Request,
    res: {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response,
  };
}

type OfferWithAuthor = Awaited<ReturnType<typeof getAllOffersService>>[number];

function createOffer(overrides: Partial<OfferWithAuthor> = {}): OfferWithAuthor {
  return {
    id: 'offer-1',
    title: 'Test offer',
    offeredCourseId: 'course-1',
    wantedCourseId: 'course-2',
    offeredGroupId: 'unit-1-1',
    wantedGroupId: 'unit-1-2',
    category: 'COURSE',
    createdById: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: {
      id: 'user',
      name: 'Jan Kowalski',
      firstName: 'Jan',
      lastName: 'Kowalski',
      image: null,
      studentIndex: '284154',
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each([
  ['getAllOffersController', offersController.getAllOffersController, getAllOffersService, {}],
  ['getMineOffersController', offersController.getMineOffersController, getMineOffersService, {}],
  [
    'postOfferController',
    offersController.postOfferController,
    postOfferService,
    { body: { offeredCourseId: 'course-1', wantedCourseId: 'course-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-2' } },
  ],
])('%s', (_name, controller, service, reqOverrides) => {
  it('returns 401 when user is not logged in', async () => {
    const { req, res } = createReqRes(reqOverrides);

    vi.mocked(getSessionUserId).mockResolvedValue(null);

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(service).not.toHaveBeenCalled();
  });

  it('returns 500 when service throws an error', async () => {
    const { req, res } = createReqRes(reqOverrides);

    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(service).mockRejectedValue(new Error('db down'));

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bład serwera bład 500' });
  });
});

describe('getAllOffersController', () => {
  it('returns 200 with all offers', async () => {
    const { req, res } = createReqRes();
    const offers = [createOffer({ id: 'offer-1' }), createOffer({ id: 'offer-2' })];

    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(getAllOffersService).mockResolvedValue(offers);

    await offersController.getAllOffersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(offers);
  });

  it('passes the category filter to the service', async () => {
    const { req, res } = createReqRes({ query: { category: 'SPORT' } });

    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(getAllOffersService).mockResolvedValue([]);

    await offersController.getAllOffersController(req, res);

    expect(getAllOffersService).toHaveBeenCalledWith('SPORT');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 for an unknown category', async () => {
    const { req, res } = createReqRes({ query: { category: 'FOO' } });

    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.getAllOffersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nieprawidłowa kategoria' });
    expect(getAllOffersService).not.toHaveBeenCalled();
  });
});

describe('getMineOffersController', () => {
  it('returns 200 with offers of the logged-in user', async () => {
    const { req, res } = createReqRes();
    const offers = [createOffer({ createdById: 'user' })];
    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(getMineOffersService).mockResolvedValue(offers);

    await offersController.getMineOffersController(req, res);

    expect(getMineOffersService).toHaveBeenCalledWith('user', undefined);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(offers);
  });
});

describe('getOfferByIdController', () => {
  it('returns 400 if id is invalid', async () => {
    const { req, res } = createReqRes({ params: {} });

    await offersController.getOfferByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nieprawidłowe id' });
    expect(getOfferByIdService).not.toHaveBeenCalled();
  });

  it('returns 200 if id is valid and service returns offer', async () => {
    const { req, res } = createReqRes({ params: { id: 'offer-1' } });
    const offer = createOffer();

    vi.mocked(getOfferByIdService).mockResolvedValue(offer);

    await offersController.getOfferByIdController(req, res);

    expect(getOfferByIdService).toHaveBeenCalledWith('offer-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(offer);
  });

  it('returns 500 if id is valid but service throws', async () => {
    const { req, res } = createReqRes({ params: { id: 'offer-1' } });

    vi.mocked(getOfferByIdService).mockRejectedValue(new Error('db down'));

    await offersController.getOfferByIdController(req, res);

    expect(getOfferByIdService).toHaveBeenCalledWith('offer-1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bład serwera bład 500' });
  });
});

describe('postOfferController', () => {
  it('returns 400 when a course or group id is missing', async () => {
    const { req, res } = createReqRes({ body: {} });
    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.postOfferController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Wszystkie pola są wymagane' });
    expect(postOfferService).not.toHaveBeenCalled();
  });

  it('returns 400 when offered and wanted courses differ', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'course-1', wantedCourseId: 'course-2', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-2' },
    });
    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.postOfferController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Można wymienić się tylko na grupę tego samego przedmiotu',
    });
    expect(postOfferService).not.toHaveBeenCalled();
  });

  it('returns 400 when offered and wanted groups are the same', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'course-1', wantedCourseId: 'course-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-1' },
    });
    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.postOfferController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Wybierz inną grupę niż oddawana' });
    expect(postOfferService).not.toHaveBeenCalled();
  });

  it('returns 201 when offer is created', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'course-1', wantedCourseId: 'course-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-2' },
    });
    const offer = createOffer();
    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(postOfferService).mockResolvedValue(offer);

    await offersController.postOfferController(req, res);

    expect(postOfferService).toHaveBeenCalledWith({
      userId: 'user',
      offeredCourseId: 'course-1',
      wantedCourseId: 'course-1',
      offeredGroupId: 'unit-1-1',
      wantedGroupId: 'unit-1-2',
      category: 'COURSE',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(offer);
  });

  it('returns 400 for an unknown category', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'course-1', wantedCourseId: 'course-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-2', category: 'FOO' },
    });
    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.postOfferController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nieprawidłowa kategoria' });
    expect(postOfferService).not.toHaveBeenCalled();
  });

  it('allows sport offers to swap between different courses', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'wf-1', wantedCourseId: 'wf-2', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-2-1', category: 'SPORT' },
    });
    const offer = createOffer({ category: 'SPORT' });
    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(postOfferService).mockResolvedValue(offer);

    await offersController.postOfferController(req, res);

    expect(postOfferService).toHaveBeenCalledWith({
      userId: 'user',
      offeredCourseId: 'wf-1',
      wantedCourseId: 'wf-2',
      offeredGroupId: 'unit-1-1',
      wantedGroupId: 'unit-2-1',
      category: 'SPORT',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when a sport offer wants the same group it offers', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'wf-1', wantedCourseId: 'wf-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-1', category: 'SPORT' },
    });
    vi.mocked(getSessionUserId).mockResolvedValue('user');

    await offersController.postOfferController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Wybierz inną grupę niż oddawana' });
    expect(postOfferService).not.toHaveBeenCalled();
  });

  it('returns 500 when service throws an error', async () => {
    const { req, res } = createReqRes({
      body: { offeredCourseId: 'course-1', wantedCourseId: 'course-1', offeredGroupId: 'unit-1-1', wantedGroupId: 'unit-1-2' },
    });
    vi.mocked(getSessionUserId).mockResolvedValue('user');
    vi.mocked(postOfferService).mockRejectedValue(new Error('db down'));

    await offersController.postOfferController(req, res);

    expect(postOfferService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bład serwera bład 500' });
  });
});