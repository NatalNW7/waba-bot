import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "<rootDir>/e2e/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
};

export default createJestConfig(config);
