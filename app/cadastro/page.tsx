// 1. O IMPORT CORRETO (Vem do 'next/image')
import Image from "next/image";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#9B7C37] via-[#CFAA56] to-[#F2D892]">
      
      <div className="bg-white p-10 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Carregando
        </h1>
        
        {/* A div abaixo ajuda a centralizar a imagem */}
        <div className="flex justify-center">
            <Image 
                src="/LOGO.jfif"       // O Next vai buscar isso na pasta PUBLIC
                alt="Logo do sistema"
                width={ 500}
                height={300}
                className="rounded-lg shadow-lg"
            />
        </div>

      </div>

    </main>
  );
}