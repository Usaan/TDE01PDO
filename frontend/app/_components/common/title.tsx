import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
const Title = async () => {
  const user = await currentUser();
  return (
    <div className="start-center mb-6 flex flex-col gap-0 px-6">
      <h1 className="text-xl">
        Olá, <span className="font-medium">{user?.firstName}!</span>
      </h1>
      <p className="text-base">
        {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(
          /^./,
          (c) => c.toUpperCase(),
        )}
      </p>
    </div>
  );
};

export default Title;
