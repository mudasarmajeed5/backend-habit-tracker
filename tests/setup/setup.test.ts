import { createTestUser, cleanUpDatabase } from "./dbHelpers.ts";

describe("Test setup", () => {
  test("Should connect to the test database", async () => {
    const { user } = await createTestUser();
    expect(user).toBeDefined();
    // await cleanUpDatabase();
  });
});
