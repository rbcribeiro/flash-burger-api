const { prisma } = require('../../dbPrisma'); // Substitua pelo caminho correto para o arquivo dbPrisma.js
const bcrypt = require('bcrypt');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,

        },
      });
  
      return resp.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
  
  getUserById: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(uid) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      resp.status(200).json(user);
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
  
  createUser: async (req, resp, next) => {
    try {
      console.log('Creating user...');
      const { email, password, role, name } = req.body;
      if (!email || !password || !role || !name) {
        console.log('Invalid input data for creating a user.');
        return next({
          status: 400,
          message: 'Todos os campos são obrigatórios.',
        });
      }

      const newUser = await prisma.users.create({
        data: {
          name,
          email,
          password: bcrypt.hashSync(password, 10),
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      console.log('User created successfully.');
      resp.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
  
  updateUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const { email, password, role, name } = req.body;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      const updatedUser = await prisma.users.update({
        where: { id: parseInt(uid) },
        data: {
          email: email || user.email,
          name: name || user.name,
          password: password ? bcrypt.hashSync(password, 10) : user.password,
          role: role || user.role,
        },
      });
      delete updatedUser.password;

      resp.status(200).json(updatedUser);
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
  
  deleteUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        return resp.status(404).json({ message: 'Usuário não encontrado' });
      }

      await prisma.users.delete({
        where: { id: parseInt(uid) },
      });
    
      resp.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
      next({ status: 500, message: 'Erro interno do servidor.' });
    }
  },
};
