export enum Category {
  ALIMENTO = "ALIMENTO",
  BEBIDA = "BEBIDA",
  DOCE = "DOCE",
  LIMPEZA = "LIMPEZA",
  HIGIENE = "HIGIENE",
  FRUTA = "FRUTA",
  VERDURA = "VERDURA",
  CARNE = "CARNE",
  LATICINIO = "LATICINIO",
  PADARIA = "PADARIA",
  CONGELADO = "CONGELADO",
  OUTROS = "OUTROS",
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  shoppingList?: ShoppingListDTO;
  products: ProductDTO[];
}

export interface ShoppingListDTO {
  id: string;
  createdAt: string;
  userId: string;
  user: UserDTO;
  items: ListItemDTO[];
}

export interface ProductDTO {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  category: Category;
  createdAt: string;
  userId?: string | null;
  user?: UserDTO | null;
  items: ListItemDTO[];
}

export interface ListItemDTO {
  id: string;
  quantity: number;
  isChecked: boolean;
  createdAt: string;
  listId: string;
  list: ShoppingListDTO;
  productId: string;
  product: ProductDTO;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: string;
  category: Category;
}

export interface AddListItemDTO {
  productId: string;
  quantity?: number;
}

export interface CreateProductAndAddToListDTO {
  product: CreateProductDTO;
  quantity?: number;
}
