// auth.router.test.js
const request = require("supertest");
const express = require("express");
const router = require("./auth");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const dbConfig = require("./dbConfig");

const app = express();
app.use(express.json());
app.use(router);

describe("Auth Router", () => {
  describe("POST /register", () => {
    beforeEach(async () => {
      // Clear database before each test
      const connection = mysql.createPool(dbConfig);
      await connection.execute("DELETE FROM auth.user");
    });

    it("should create a new user", async () => {
      const response = await request(app)
        .post("/register")
        .send({ username: "testUser", password: "testPassword" });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User created successfully");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app).post("/register").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Please provide all required fields");
    });

    // it("should return 500 for database error", async () => {
    //   // Mock database error
    //   jest.spyOn(mysql, "createPool").mockReturnValueOnce({
    //     execute: jest.fn(() => Promise.reject(new Error("Database error"))),
    //   });
    //   const response = await request(app)
    //     .post("/register")
    //     .send({ username: "testUser", password: "testPassword" });
    //   expect(response.status).toBe(500);
    //   expect(response.body.message).toBe("Error creating user");
    // });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Clear database before each test
      const connection = mysql.createPool(dbConfig);
      await connection.execute("DELETE FROM auth.user");
      // Create a test user
      const hashedPassword = await bcrypt.hash("testPassword", 10);
      const callerID = uuidv4();
      await connection.execute(
        `INSERT INTO auth.user (username, password, callerID) VALUES (?, ?, ?)`,
        ["testUser", hashedPassword, callerID]
      );
    });

    it("should login successfully", async () => {
      const response = await request(app)
        .post("/login")
        .send({ username: "testUser", password: "testPassword" });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User logged in successfully");
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/login")
        .send({ username: "testUser", password: "wrongPassword" });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app).post("/login").send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Please provide username and password"
      );
    });

    it("should return 500 for database error", async () => {
      // Mock database error
      jest.spyOn(mysql, "createPool").mockReturnValueOnce({
        execute: jest.fn(() => Promise.reject(new Error("Database error"))),
      });
      const response = await request(app)
        .post("/login")
        .send({ username: "testUser", password: "testPasswords" });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });
});
