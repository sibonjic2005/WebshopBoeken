import { registerUser, loginUser, logoutUser } from "@/app/user/actions";
import { query } from "@/app/db";
import { setUserSession, clearUserSession } from "@/app/lib/session";
import bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";

jest.mock("@/app/db");
jest.mock("@/app/lib/redis", () => ({ redis: { set: jest.fn(), get: jest.fn(), del: jest.fn() } }));
jest.mock("@/app/lib/session");
jest.mock("bcryptjs");
jest.mock("next/navigation");

beforeEach(() => {
  jest.clearAllMocks();
});

// registerUser - happy flow
test("registerUser should successfully register a user", async () => {
  (query as jest.Mock)
    .mockResolvedValueOnce([]) // no email
    .mockResolvedValueOnce([{ id: 1 }]); // create user
  (bcryptjs.genSalt as jest.Mock).mockResolvedValueOnce("salt");
  (bcryptjs.hash as jest.Mock).mockResolvedValueOnce("hashedPassword");

  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "password123");
  formData.append("confirmPassword", "password123");
  formData.append("firstName", "John");
  formData.append("lastName", "Doe");

  const result = await registerUser(formData);

  expect(result.success).toBe(true);
  expect(setUserSession).toHaveBeenCalledWith(1);
});

// registerUser - sad flow
test("registerUser should fail if email already exists", async () => {
  (query as jest.Mock).mockResolvedValueOnce([{ id: 1 }]); // email exists

  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "password123");
  formData.append("confirmPassword", "password123");
  formData.append("firstName", "John");
  formData.append("lastName", "Doe");

  const result = await registerUser(formData);

  expect(result.success).toBe(false);
});

test("registerUser should fail if passwords don't match", async () => {
  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "password123");
  formData.append("confirmPassword", "password456");
  formData.append("firstName", "John");
  formData.append("lastName", "Doe");

  const result = await registerUser(formData);

  expect(result.success).toBe(false);
});

test("registerUser should fail if email is invalid", async () => {
  const formData = new FormData();
  formData.append("email", "invalid-email");
  formData.append("password", "password123");
  formData.append("confirmPassword", "password123");
  formData.append("firstName", "John");
  formData.append("lastName", "Doe");

  const result = await registerUser(formData);

  expect(result.success).toBe(false);
});

// loginUser - happy flow
test("loginUser should successfully login a user", async () => {
  (query as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      password_hash: "hashedPassword",
    },
  ]);
  (bcryptjs.compare as jest.Mock).mockResolvedValueOnce(true);

  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "password123");

  const result = await loginUser(formData);

  expect(result.success).toBe(true);
  expect(setUserSession).toHaveBeenCalledWith(1);
});

// loginUser - sad flow
test("loginUser should fail if user doesn't exist", async () => {
  (query as jest.Mock).mockResolvedValueOnce([]); // no user

  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "password123");

  const result = await loginUser(formData);

  expect(result.success).toBe(false);
});

test("loginUser should fail if password is incorrect", async () => {
  (query as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      password_hash: "hashedPassword",
    },
  ]);
  (bcryptjs.compare as jest.Mock).mockResolvedValueOnce(false);

  const formData = new FormData();
  formData.append("email", "user@example.com");
  formData.append("password", "wrongpassword");

  const result = await loginUser(formData);

  expect(result.success).toBe(false);
});

// logoutUser
test("logoutUser should clear user session on logout", async () => {
  await logoutUser();
  expect(clearUserSession).toHaveBeenCalled();
  expect(redirect).toHaveBeenCalledWith("/");
});
