import { Search } from "lucide-react";

import AddProductButton from "./_components/common/add-product-button";
import Footer from "./_components/common/footer";
import Navbar from "./_components/common/navbar";
import ProductItem from "./_components/common/product-item";
import Title from "./_components/common/title";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "./_components/ui/input-group";
import { ScrollArea } from "./_components/ui/scroll-area";

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `item.${a.length - i}`,
);

export default function Page() {
  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
      <Navbar />
      <Title />

      <div className="flex flex-col gap-2 px-6">
        <h3 className="font-semibold text-secondary-foreground">LISTA</h3>

        <div className="mb-1.5 flex items-center justify-between gap-2.5">
          <InputGroup className="rounded-lg">
            <InputGroupInput placeholder="Buscar..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <AddProductButton />
        </div>
      </div>

      <div className="mb-2 min-h-0 flex-1 px-3 pb-0">
        <ScrollArea className="h-full w-full px-2.5">
          <div className="space-y-2 p-1">
            {tags.map((tag) => (
              <ProductItem key={tag} />
            ))}
          </div>
        </ScrollArea>
      </div>

      <Footer />
    </div>
  );
}
