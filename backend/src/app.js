const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "http://localhost:3001",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "API Lista de Compras funcionando!" });
});

// ROTAS DE USUÁRIOS
app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório" });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ error: "Google Client ID não configurado" });
    }

    let googleUser;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      googleUser = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture: photo,
      email_verified,
    } = googleUser;

    if (!email_verified) {
      return res
        .status(400)
        .json({ error: "Email não verificado pelo Google" });
    }

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Email já cadastrado com outro Google ID" });
      }
      user = await prisma.user.create({
        data: {
          firstName: firstName || "Usuário",
          lastName: lastName || "",
          email,
          googleId,
          photo,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName || "",
          email,
          photo,
        },
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, photo } = req.body;

    if (firstName !== undefined && firstName.trim() === "") {
      return res.status(400).json({ error: "Nome não pode estar vazio" });
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName || "";
    if (photo !== undefined) updateData.photo = photo;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ROTAS DE PRODUTOS
app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { user: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, description, price, category, userId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Nome do produto é obrigatório" });
    }
    if (price && price < 0) {
      return res.status(400).json({ error: "Preço não pode ser negativo" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price) || 0,
        category: category || "OUTROS",
        userId,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

app.patch("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({ error: "Nome não pode estar vazio" });
    }
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: "Preço não pode ser negativo" });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// ROTAS DE LISTA DE COMPRAS
app.get("/shopping-list/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const shoppingList = await prisma.shoppingList.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!shoppingList) {
      const newList = await prisma.shoppingList.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
      return res.json({ ...newList, totalEstimado: 0, totalItens: 0 });
    }

    let totalEstimado = 0;
    for (const item of shoppingList.items) {
      let itemPrice = item.product.price * item.quantity;
      if (item.product.category === "FRUTA") itemPrice *= 0.9;
      if (item.product.category === "VERDURA") itemPrice *= 0.85;
      if (item.product.category === "DOCE") itemPrice *= 1.05;
      totalEstimado += itemPrice;
    }

    const totalItens = shoppingList.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    res.json({
      ...shoppingList,
      totalEstimado: parseFloat(totalEstimado.toFixed(2)),
      totalItens,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar lista de compras" });
  }
});

app.post("/shopping-list/:userId/items", async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, productName, quantity, category, price, description } =
      req.body;

    if (!productId && (!productName || productName.trim() === "")) {
      return res
        .status(400)
        .json({ error: "É necessário informar productId ou productName" });
    }
    if (quantity !== undefined && quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Quantidade deve ser maior que zero" });
    }

    let shoppingList = await prisma.shoppingList.findUnique({
      where: { userId },
    });
    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({ data: { userId } });
    }

    let finalProductId = productId;

    if (!productId && productName) {
      let existingProduct = await prisma.product.findFirst({
        where: { name: productName, userId },
      });

      if (!existingProduct) {
        existingProduct = await prisma.product.create({
          data: {
            name: productName,
            description: description || null,
            price: price || 0,
            category: category || "OUTROS",
            userId,
          },
        });
      } else {
        existingProduct = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            description: description ?? existingProduct.description,
            price: price ?? existingProduct.price,
            category: category ?? existingProduct.category,
          },
        });
      }

      finalProductId = existingProduct.id;
    }

    const existingItem = await prisma.listItem.findUnique({
      where: {
        listId_productId: {
          listId: shoppingList.id,
          productId: finalProductId,
        },
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.listItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
        include: { product: true },
      });
      return res.json(updatedItem);
    }

    const listItem = await prisma.listItem.create({
      data: {
        listId: shoppingList.id,
        productId: finalProductId,
        quantity: quantity || 1,
      },
      include: { product: true },
    });

    res.status(201).json(listItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar item à lista" });
  }
});

app.patch("/list-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, isChecked } = req.body;

    if (quantity !== undefined && quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Quantidade deve ser maior que zero" });
    }

    const listItem = await prisma.listItem.update({
      where: { id },
      data: { quantity, isChecked },
      include: { product: true },
    });

    res.json(listItem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
});

app.delete("/list-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.listItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover item" });
  }
});

module.exports = { app, prisma };
