module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testEnvironment: 'node', 
  collectCoverage: true, 
  coverageDirectory: 'coverage', 
  collectCoverageFrom: [
    'src/**/*.ts',
    'test/**/*.ts',
    '!src/**/*.d.ts', 
    '!test/**/*.d.ts'
  ],
  moduleDirectories: ["node_modules", "src", "test"],
};