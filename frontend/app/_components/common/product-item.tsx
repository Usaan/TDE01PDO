import { CakeSlice, EllipsisVertical, Settings2, Trash } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ProductItem = () => {
  return (
    <Card className="p-3 px-4 pr-2">
      <CardContent className="flex items-center justify-between rounded-lg border-0 p-0">
        {/* left */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-between rounded-lg bg-primary/15 p-1.5">
              <CakeSlice className="text-primary" size={35} strokeWidth={1.3} />
            </div>
            <div className="flex w-full flex-col gap-0">
              <h1 className="line-clamp-1 text-lg">Chocolate CupCake</h1>
              <div className="flex w-full max-w-full items-center justify-start gap-1 p-0">
                <Badge variant={"secondary"}>Doces</Badge>
                <Badge variant={"secondary"}>Essenciais</Badge>
              </div>
            </div>
          </div>
        </div>
        {/* right */}
        <div className="flex items-center gap-2">
          <div className="justify-right flex flex-col items-center gap-0 p-0 text-right text-sm text-primary">
            <p className="w-fit">
              R$ <span className="text-lg text-foreground">8,00</span>
            </p>
            <p className="w-fit">
              qtd: <span className="text-foreground">1</span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant={"ghost"} className="h-fit w-fit p-1">
                  <EllipsisVertical />
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-secondary-foreground">
                  Opções
                </DropdownMenuLabel>
                <DropdownMenuItem>
                  <Settings2 /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash className="mb-0.5" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductItem;
