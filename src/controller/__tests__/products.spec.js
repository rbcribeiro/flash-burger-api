const ProductsController = require('../productsController');

const { prisma } = require('../../../dbPrisma');

describe('Testes das funções de rota', () => {
  beforeAll(async () => {
    // Crie produtos de teste no banco de dados Prisma para os testes.
    await prisma.products.createMany({
      data: [
        {
          name: 'Produto 1',
          price: 10.99,
          image: 'imagem1.jpg',
          type: 'Tipo A',
        },
        {
          name: 'Produto 2',
          price: 20.99,
          image: 'imagem2.jpg',
          type: 'Tipo B',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.products.deleteMany();
  });

  it('Deve buscar todos os produtos', async () => {
    const req = {};
    const resp = {
      json: jest.fn(),
    };
    const next = jest.fn();

    await ProductsController.getProducts(req, resp, next);

    expect(resp.json).toHaveBeenCalled();
  });

  it('Deve buscar um produto por ID', async () => {
    const req = {
      params: {
        productId: '1',
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await ProductsController.getProductById(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalled();
  });

  it('Deve criar um novo produto', async () => {
    const req = {
      body: {
        name: 'Novo Produto',
        price: 15.99,
        image: 'imagem3.jpg',
        type: 'Tipo C',
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await ProductsController.createProduct(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(201);
    expect(resp.json).toHaveBeenCalled();
  });

  it('Deve atualizar um produto existente', async () => {
    const req = {
      params: {
        productId: '1',
      },
      body: {
        name: 'Produto Atualizado',
        price: 12.99,
      },
    };
    const resp = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await ProductsController.updateProduct(req, resp, next);

    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalled();
  });

  it('Deve criar um novo produto e depois excluí-lo', async () => {
    // Criar um novo produto
    const newProductData = {
      name: 'Novo Produto',
      price: 15.99,
      image: 'imagem3.jpg',
      type: 'Tipo C',
    };

    const reqCreate = {
      body: newProductData,
    };

    const respCreate = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextCreate = jest.fn();

    await ProductsController.createProduct(reqCreate, respCreate, nextCreate);

    // Verificar se o produto foi criado com sucesso
    expect(respCreate.status).toHaveBeenCalledWith(201);
    expect(respCreate.json).toHaveBeenCalled();

    // Obter o ID do produto criado
    createdProductId = respCreate.json.mock.calls[0][0].id;

    // Excluir o produto recém-criado
    const reqDelete = {
      params: {
        productId: createdProductId.toString(),
      },
    };

    const respDelete = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextDelete = jest.fn();

    await ProductsController.deleteProduct(reqDelete, respDelete, nextDelete);

    // Verificar se o produto foi excluído com sucesso
    expect(respDelete.status).toHaveBeenCalledWith(200);
    expect(respDelete.json).toHaveBeenCalled();
  });
});

