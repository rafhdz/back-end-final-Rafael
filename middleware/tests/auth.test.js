const jwt = require("jsonwebtoken");
const authenticateToken = require("../../middleware/auth");

describe("authenticateToken middleware", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: "testsecret" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("debe responder 401 si no hay token", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token requerido" });
  });

  it("debe responder 403 si el token es inválido", () => {
    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token inválido o expirado",
    });
  });

  it("debe llamar next() y asignar req.user si el token es válido", () => {
    const payload = { id: 1, name: "Rafael" };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    authenticateToken(req, res, next);
    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalled();
  });
});
