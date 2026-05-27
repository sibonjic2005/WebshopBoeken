import { registerUser, loginUser, logoutUser } from "@/app/user/actions";
import { query } from "@/app/db";
import { setUserSession, clearUserSession } from "@/app/lib/session";
import bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";

jest.mock("@/app/db");
jest.mock("@/app/lib/session");
jest.mock("bcryptjs");
jest.mock("next/navigation");

describe("Auth Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should successfully register a user", async () => {
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
  });

  describe("loginUser", () => {
    it("should successfully login a user", async () => {
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
  });

  describe("logoutUser", () => {
    it("should clear user session on logout", async () => {
      await logoutUser();
      expect(clearUserSession).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/");
    });
  });
});
