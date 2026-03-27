import { ShoppingBasket } from "lucide-react";

const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-between rounded-t-xl bg-primary px-6 py-4 text-background">
      <div className="flex gap-1">
        <ShoppingBasket size={22} />
        <h2 className="mt-[0.05rem] font-bold">12</h2>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium">
        <h2 className="text-lg font-bold">R$ 100,00</h2>
      </div>
    </footer>
  );
};

export default Footer;
