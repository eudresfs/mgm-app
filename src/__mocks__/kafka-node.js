// Mock for kafka-node
const kafkaMock = {
  KafkaClient: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined)
  })),
  Producer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn().mockImplementation((payloads, callback) => {
      callback(null, { status: 'success' });
    }),
    createTopics: jest.fn().mockImplementation((topics, async, callback) => {
      callback(null, 'Topic created');
    })
  })),
  Consumer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    addTopics: jest.fn().mockImplementation((topics, callback) => {
      callback(null, 'Topics added');
    })
  })),
  Offset: jest.fn().mockImplementation(() => ({
    fetch: jest.fn().mockImplementation((payloads, callback) => {
      callback(null, [{ topic: 'test', offset: 0 }]);
    })
  })),
  Admin: jest.fn().mockImplementation(() => ({
    listTopics: jest.fn().mockImplementation((callback) => {
      callback(null, ['topic1', 'topic2']);
    }),
    createTopics: jest.fn().mockImplementation((topics, callback) => {
      callback(null, 'Topics created');
    })
  }))
};

module.exports = kafkaMock;