const mockRedis = {
  set: jest.fn().mockResolvedValue("OK"),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(0),
  ttl: jest.fn().mockResolvedValue(-2),
};

export default jest.fn(() => mockRedis);
