const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function iniciarConexao() {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
}

async function fecharConexao() {
  try {
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados encerrada.');
  } catch (error) {
    console.error('Erro ao desconectar do banco de dados:', error);
  }
}

module.exports = {
  prisma,
  iniciarConexao,
  fecharConexao,
};
