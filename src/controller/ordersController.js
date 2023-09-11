const { prisma } = require("../../dbPrisma");

module.exports = {
    getOrders: async (req, resp, next) => {
        try {
            const orders = await prisma.orders.findMany({
            select: {
                id: true,
                userId: true,
                client: true,
                status: true,
                createdAt: true,
            },
            });

            if (!orders || orders.length === 0) {
            return resp.status(404).json({ message: 'Nenhuma order encontrada.' });
            }

            const formattedOrders = await Promise.all(orders.map(async (order) => {
            const products = await prisma.orders_products.findMany({
                where: {
                orderId: order.id,
                },
                select: {
                qty: true,
                products: {
                    select: {
                    id: true,
                    name: true,
                    },
                },
                },
            });

            return {
                id: order.id,
                userId: order.userId,
                client: order.client,
                status: order.status,
                Products: products.map((product) => ({
                id: product.products.id,
                name: product.products.name,
                qty: product.qty,
                })),
            };
            }));

            return resp.status(200).json(formattedOrders);
        } catch (error) {
            console.error('Erro:', error);
            next(error);
        }
        },
    
    getOrderById: async (req, resp, next) => {
        try {
            const { orderId } = req.params;
        
            const order = await prisma.orders.findUnique({
            where: {
                id: parseInt(orderId),
            },
            select: {
                id: true,
                userId: true,
                client: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                products: {
                select: {
                    id: true,
                    qty: true,
                    products: {
                    select: {
                        id: true,
                        name: true,
                    },
                    },
                },
                },
            },
            });
        
            if (!order) {
            return resp.status(404).json({ message: `Ordem com ID ${orderId} não encontrada.` });
            }
        
            const user = await prisma.users.findUnique({
            where: {
                id: order.userId,
            },
            select: {
                name: true,
            },
            });
        
            const responseOrder = {
            orderId: order.id,
            functionary: user.name,
            client: order.client,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            Products: order.products.map((productData) => ({
                id: productData.products.id,
                name: productData.products.name,
                qty: productData.qty,
            })),
            };
        
            return resp.status(200).json(responseOrder);
        } catch (error) {
            console.error('Erro:', error);
            next(error);
        } finally {
            await prisma.$disconnect();
        }
        },
        
  
    createOrder: async (req, resp, next) => {
        try {
            const { userId, client, products } = req.body;
        
            if (!userId || !client || !products || !products.length) {
              return resp
                .status(400)
                .json({ message: "Dados incompletos na requisição." });
            }
        
            const existingUser = await prisma.users.findUnique({
              where: {
                id: userId,
              },
            });
        
            if (!existingUser) {
              return resp
                .status(404)
                .json({ message: `Usuário com ID ${userId} não encontrado.` });
            }
        
            const createdAt = new Date(); 
            const updatedAt = new Date(); 
        
            const order = await prisma.orders.create({
              data: {
                userId,
                client,
                status: "PEDIDO_REALIZADO",
                createdAt,
              },
            });
        
            const addProductPromises = products.map(async (productData) => {
              const { qty, product } = productData;
              const existingProduct = await prisma.products.findUnique({
                where: {
                  id: product.id,
                },
              });
        
              if (!existingProduct) {
                return resp
                  .status(404)
                  .json({ message: `Produto com ID ${product.id} não encontrado.` });
              }
        
              await prisma.orders_products.create({
                data: {
                  orderId: order.id,
                  productId: existingProduct.id,
                  qty: qty,
                },
              });
            });
        
            await Promise.all(addProductPromises);
        
            const orderInfo = await prisma.orders.findUnique({
              where: {
                id: order.id,
              },
              select: {
                id: true,
                client: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            });
        
            const orderProducts = await prisma.orders_products.findMany({
              where: {
                orderId: order.id,
              },
              select: {
                qty: true,
                products: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            });
        
            const functionary = existingUser.name;
        
            console.log("orderInfo:", orderInfo);
            console.log("orderProducts:", orderProducts);
        
            const responseOrder = {
              id: orderInfo.id,
              functionary: functionary,
              client: orderInfo.client,
              status: orderInfo.status,
              createdAt: orderInfo.createdAt,
              updatedAt: orderInfo.updatedAt,
              Products: orderProducts.map((productData) => ({
                id: productData.products.id,
                name: productData.products.name,
                qty: productData.qty,
              })),
            };
        
            console.log("responseOrder:", responseOrder);
        
            return resp.status(201).json(responseOrder);
          } catch (error) {
            console.error("Erro:", error);
            next(error);
          } finally {
            await prisma.$disconnect();
          }
    },

    updateOrder: async (req, resp, next) => {
        try {
          const { orderId } = req.params;
          const { status } = req.body;
      
          const allowedStatusValues = ["PEDIDO_REALIZADO", "PEDIDO_EM_ANDAMENTO", "PEDIDO_CONCLUIDO"];
      
          if (!allowedStatusValues.includes(status)) {
            return resp.status(400).json({
              message: `O valor do campo status deve ser um dos seguintes: ${allowedStatusValues.join(", ")}`,
            });
          }
      
          let dataToUpdate = {
            status,
          };
      
          if (status === "PEDIDO_CONCLUIDO") {
            dataToUpdate.updatedAt = new Date();
          }
      
          const order = await prisma.orders.update({
            where: { id: parseInt(orderId) },
            data: dataToUpdate,
          });
      
          const responseOrder = {
            id: order.id,
            userId: order.userId,
            client: order.client,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt, // Aqui você pode manter a data de atualização
          };
      
          resp.status(200).json(responseOrder);
        } catch (error) {
          next(error);
        }
      },

      deleteOrder: async (req, resp, next) => {
        try {
          const { orderId } = req.params;
          const orderIdInt = parseInt(orderId); // Converte o orderId para Int
      
          await prisma.orders.delete({
            where: { id: orderIdInt }, // Usa o orderIdInt convertido
          });
      
          resp.status(200).json({ message: "Ordem excluída com sucesso!" });
        } catch (error) {
          next(error);
        }
      },
    }
