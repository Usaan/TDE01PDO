const request = require("supertest");
const { app, prisma } = require("../app");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    shoppingList: {
      findUnique: jest.fn(),
    },
    listItem: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const prismaMock = new (require("@prisma/client").PrismaClient)();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /", () => {
  it("retorna mensagem de status da API", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("API Lista de Compras funcionando!");
  });
});

describe("GET /products", () => {
  it("retorna lista de produtos", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { id: "1", name: "Arroz", price: "5.00", category: "ALIMENTO" },
    ]);

    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Arroz");
  });
});

describe("POST /products", () => {
  it("cria um produto com sucesso", async () => {
    const produto = {
      id: "1",
      name: "Leite",
      price: "4.50",
      category: "LATICINIO",
    };
    prismaMock.product.create.mockResolvedValue(produto);

    const res = await request(app).post("/products").send({
      name: "Leite",
      price: 4.5,
      category: "LATICINIO",
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Leite");
  });

  it("retorna 400 se nome estiver vazio", async () => {
    const res = await request(app).post("/products").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nome do produto é obrigatório");
  });

  it("retorna 400 se preço for negativo", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "Pão", price: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Preço não pode ser negativo");
  });
});

describe("PATCH /products/:id", () => {
  it("atualiza produto com sucesso", async () => {
    const produto = {
      id: "1",
      name: "Leite Integral",
      price: "5.00",
      category: "LATICINIO",
    };
    prismaMock.product.findUnique.mockResolvedValue(produto);
    prismaMock.product.update.mockResolvedValue({ ...produto, price: "5.00" });

    const res = await request(app).patch("/products/1").send({ price: 5.0 });
    expect(res.status).toBe(200);
  });

  it("retorna 404 se produto não existir", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const res = await request(app).patch("/products/999").send({ price: 5.0 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Produto não encontrado");
  });
});
