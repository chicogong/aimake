import { describe, it, expect } from 'vitest';
import { generateId, generateShortId, generatePrefixedId } from '../utils/id';
import { success, error, created } from '../utils/response';

describe('ID Utils', () => {
  it('generateId creates valid UUID v4', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generateId creates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('generateShortId creates 8 character ID', () => {
    const id = generateShortId();
    expect(id.length).toBe(8);
  });

  it('generateShortId only uses alphanumeric characters', () => {
    const id = generateShortId();
    expect(id).toMatch(/^[0-9a-f]+$/);
  });

  it('generatePrefixedId creates ID with prefix', () => {
    const id = generatePrefixedId('job');
    expect(id).toMatch(/^job_[0-9a-f]{32}$/);
  });

  it('generatePrefixedId works with different prefixes', () => {
    const audioId = generatePrefixedId('audio');
    const userId = generatePrefixedId('user');

    expect(audioId.startsWith('audio_')).toBe(true);
    expect(userId.startsWith('user_')).toBe(true);
  });
});

describe('Response Utils', () => {
  // Mock Hono context with proper typing
  interface MockResponse {
    data: unknown;
    status: number;
  }

  const createMockContext = () => {
    let responseData: unknown;
    let responseStatus = 200;

    return {
      json: (data: unknown, status?: number): MockResponse => {
        responseData = data;
        if (status) responseStatus = status;
        return { data: responseData, status: responseStatus };
      },
      getResponse: (): MockResponse => ({ data: responseData, status: responseStatus }),
    };
  };

  it('success returns correct format', () => {
    const c = createMockContext();
    const result = success(c as never, { message: 'test' }) as unknown as MockResponse;

    expect(result.data).toEqual({
      success: true,
      data: { message: 'test' },
    });
  });

  it('success includes meta when provided', () => {
    const c = createMockContext();
    const meta = { total: 100, page: 1, pageSize: 20 };
    const result = success(c as never, { items: [] }, meta) as unknown as MockResponse;

    expect(result.data).toEqual({
      success: true,
      data: { items: [] },
      meta: {
        total: 100,
        page: 1,
        pageSize: 20,
      },
    });
  });

  it('created returns 201 status', () => {
    const c = createMockContext();
    const result = created(c as never, { id: '123' }) as unknown as MockResponse;

    expect(result.data).toEqual({
      success: true,
      data: { id: '123' },
    });
    expect(result.status).toBe(201);
  });

  it('error returns correct format', () => {
    const c = createMockContext();
    const result = error(c as never, 'BAD_REQUEST', 'Invalid input', 400) as unknown as MockResponse;

    expect(result.data).toEqual({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid input',
      },
    });
    expect(result.status).toBe(400);
  });

  it('error includes details when provided', () => {
    const c = createMockContext();
    const details = { field: 'email' };
    const result = error(c as never, 'VALIDATION_ERROR', 'Invalid email', 400, details) as unknown as MockResponse;

    expect(result.data).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email',
        details: { field: 'email' },
      },
    });
  });
});
