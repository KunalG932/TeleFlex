// Mock require function
const mockRequire = jest.fn();
global.require = mockRequire;

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 