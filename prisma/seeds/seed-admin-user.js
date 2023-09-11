const bcrypt = require("bcrypt");
const { prisma, iniciarConexao, fecharConexao } = require("../../dbPrisma");

async function seedData() {
  const saltRounds = 10;
  try {
    await iniciarConexao(); // Inicia a conexão com o banco de dados

    const existingUser = await prisma.users.findFirst({
      where: { email: "admin@admin.com" },
    });

      if (!existingUser) {
      const plaintextPassword = "admin";
      const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);
      await prisma.users.create({
        data: {
          name: "Renata Ribeiro",
          email: "admin@admin.com",
          password: hashedPassword,
          role: "admin",
        },
      });

      console.log("Dados de seed inseridos com sucesso.");
    } else {
      console.log(
        'O usuário com o email "admin@admin.com" já existe. Nenhum dado de seed inserido.'
      );
    }
  } catch (error) {
    console.error("Erro ao inserir dados de seed:", error);
  } finally {
    await fecharConexao(); 
  }
}
seedData()

