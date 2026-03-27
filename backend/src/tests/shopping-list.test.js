const request = require("supertest");
const { app, prisma } = require("../app");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    shoppingList: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    listItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prismaMock = new (require("@prisma/client").PrismaClient)();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /shopping-list/:userId", () => {
  it("cria e retorna lista vazia se não existir", async () => {
    prismaMock.shoppingList.findUnique.mockResolvedValue(null);
    prismaMock.shoppingList.create.mockResolvedValue({
      id: "list-1",
      userId: "user-1",
      createdAt: new Date(),
      items: [],
    });

    const res = await request(app).get("/shopping-list/user-1");
    expect(res.status).toBe(200);
    expect(res.body.totalEstimado).toBe(0);
    expect(res.body.totalItens).toBe(0);
  });

  it("retorna lista com totais calculados", async () => {
    prismaMock.shoppingList.findUnique.mockResolvedValue({
      id: "list-1",
      userId: "user-1",
      createdAt: new Date(),
      items: [
        {
          id: "item-1",
          quantity: 2,
          isChecked: false,
          product: {
            id: "prod-1",
            name: "Arroz",
            price: 10,
            category: "ALIMENTO",
          },
        },
      ],
    });

    const res = await request(app).get("/shopping-list/user-1");
    expect(res.status).toBe(200);
    expect(res.body.totalEstimado).toBe(20);
    expect(res.body.totalItens).toBe(2);
  });
});

describe("POST /shopping-list/:userId/items", () => {
  it("retorna 400 se não informar productId nem productName", async () => {
    const res = await request(app)
      .post("/shopping-list/user-1/items")
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "É necessário informar productId ou productName",
    );
  });

  it("retorna 400 se quantidade for zero ou negativa", async () => {
    const res = await request(app)
      .post("/shopping-list/user-1/items")
      .send({ productName: "Leite", quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Quantidade deve ser maior que zero");
  });

  it("cria item na lista com productName novo", async () => {
    prismaMock.shoppingList.findUnique.mockResolvedValue({
      id: "list-1",
      userId: "user-1",
    });
    prismaMock.product.findFirst.mockResolvedValue(null);
    prismaMock.product.create.mockResolvedValue({
      id: "prod-1",
      name: "Leite",
      price: 4.5,
      category: "LATICINIO",
    });
    prismaMock.listItem.findUnique.mockResolvedValue(null);
    prismaMock.listItem.create.mockResolvedValue({
      id: "item-1",
      quantity: 1,
      isChecked: false,
      product: {
        id: "prod-1",
        name: "Leite",
        price: 4.5,
        category: "LATICINIO",
      },
    });

    const res = await request(app)
      .post("/shopping-list/user-1/items")
      .send({
        productName: "Leite",
        quantity: 1,
        category: "LATICINIO",
        price: 4.5,
      });

    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe("Leite");
  });
});

describe("PATCH /list-items/:id", () => {
  it("marca item como checado", async () => {
    prismaMock.listItem.update.mockResolvedValue({
      id: "item-1",
      quantity: 1,
      isChecked: true,
      product: {
        id: "prod-1",
        name: "Leite",
        price: 4.5,
        category: "LATICINIO",
      },
    });

    const res = await request(app)
      .patch("/list-items/item-1")
      .send({ isChecked: true });

    expect(res.status).toBe(200);
    expect(res.body.isChecked).toBe(true);
  });
});

describe("DELETE /list-items/:id", () => {
  it("remove item com sucesso", async () => {
    prismaMock.listItem.delete.mockResolvedValue({});

    const res = await request(app).delete("/list-items/item-1");
    expect(res.status).toBe(204);
  });
});
