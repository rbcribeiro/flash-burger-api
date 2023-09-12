const { prisma } = require('../../dbPrisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config');
 
module.exports = {
  postAuth: async (req, resp) => {
    console.info('Received login request');
    const { email, password } = req.body;

    if (!email || !password) {
      console.info('Bad request - Missing email or password');
      return resp.status(400).json({ message: 'Bad request' });
    }

    try {
      const user = await prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        console.info('User not found');
        return resp.status(404).json({ message: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.info('Invalid password');
        return resp.status(401).json({ message: 'Unauthorized' });
      }
      

      const token = jwt.sign({ email: user.email, role: user.role }, secret, {
        expiresIn: '1h',
      });

      console.info('Login successful');
      resp.status(200).json({ token });
    } catch (error) {
      console.error('Internal server error:', error);
      return resp.status(500).json({ message: 'Internal server error' });
    }
  },
};
