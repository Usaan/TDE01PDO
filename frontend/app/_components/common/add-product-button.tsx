"use client";

import {
  Apple,
  Beef,
  Candy,
  Croissant,
  GlassWater,
  Leaf,
  type LucideIcon,
  Milk,
  Package,
  Plus,
  Snowflake,
  Sparkles,
  SprayCan,
} from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/app/_components/ui/select";
import { Textarea } from "@/app/_components/ui/textarea";
import { Category } from "@/app/_lib/dtos/shopping-list.dto";

import { Button } from "../ui/button";

const categories = Object.values(Category);

const categoryIcons: Record<Category, LucideIcon> = {
  [Category.ALIMENTO]: Package,
  [Category.BEBIDA]: GlassWater,
  [Category.DOCE]: Candy,
  [Category.LIMPEZA]: SprayCan,
  [Category.HIGIENE]: Sparkles,
  [Category.FRUTA]: Apple,
  [Category.VERDURA]: Leaf,
  [Category.CARNE]: Beef,
  [Category.LATICINIO]: Milk,
  [Category.PADARIA]: Croissant,
  [Category.CONGELADO]: Snowflake,
  [Category.OUTROS]: Package,
};

const categoryLabels: Record<Category, string> = {
  [Category.ALIMENTO]: "Alimento",
  [Category.BEBIDA]: "Bebida",
  [Category.DOCE]: "Doce",
  [Category.LIMPEZA]: "Limpeza",
  [Category.HIGIENE]: "Higiene",
  [Category.FRUTA]: "Fruta",
  [Category.VERDURA]: "Verdura",
  [Category.CARNE]: "Carne",
  [Category.LATICINIO]: "Laticínio",
  [Category.PADARIA]: "Padaria",
  [Category.CONGELADO]: "Congelado",
  [Category.OUTROS]: "Outros",
};

const AddProductButton = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    Category.OUTROS,
  );

  const SelectedCategoryIcon = categoryIcons[selectedCategory];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="rounded-lg">
            <Plus />
            item
          </Button>
        }
      />

      <DialogContent className="max-w-8/10 rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-start gap-2 text-xl">
            <Plus size={20} className="text-primary" />
            Adicionar Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nome do produto</label>
            <Input placeholder="Ex.: Detergente" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Descreva o produto (opcional)"
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Preço</label>
              <Input
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Quantidade</label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                defaultValue={1}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as Category)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <SelectedCategoryIcon className="h-4 w-4 text-primary" />
                  <span>{categoryLabels[selectedCategory]}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => {
                    const Icon = categoryIcons[category];

                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span>{categoryLabels[category]}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">
            <Plus />
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductButton;
