// Mock for redis
const redisMock = {
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    hIncrBy: jest.fn().mockResolvedValue(1),
    hIncrByFloat: jest.fn().mockResolvedValue(1.0),
    zAdd: jest.fn().mockResolvedValue(1),
    lPush: jest.fn().mockResolvedValue(1),
    lRange: jest.fn().mockResolvedValue([]),
    lRem: jest.fn().mockResolvedValue(0)
  })
};

module.exports = redisMock;