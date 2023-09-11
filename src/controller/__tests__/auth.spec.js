const AuthController = require('../authController');
const { prisma } = require('../../../dbPrisma');
const bcrypt = require('bcrypt');


describe('postAuth', () => {
  jest.spyOn(prisma.users, 'findUnique');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a token on successful login', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    prisma.users.findUnique.mockResolvedValue({
      email: 'user@example.com',
      password: hashedPassword,
      role: 'userRole',
    });

    const req = {
      body: {
        email: 'user@example.com',
        password: 'password',
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await AuthController.postAuth(req, resp);

    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
  });;

  it('should return a 404 status if user is not found', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const req = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password',
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await AuthController.postAuth(req, resp);

    expect(resp.status).toHaveBeenCalledWith(404);
  });

  it('should return a 404 status if password does not match', async () => {
    prisma.users.findUnique.mockResolvedValue({
      email: 'user@example.com',
      password: 'hashedPassword',
      role: 'userRole',
    });

    const req = {
      body: {
        email: 'user@example.com',
        password: 'wrongPassword', 
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await AuthController.postAuth(req, resp);

    expect(resp.status).toHaveBeenCalledWith(404);
  });


});
