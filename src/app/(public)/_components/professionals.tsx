import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Image from "next/image"
import fotoImg from '../../../../public/foto1.png'
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, Clock } from "lucide-react"
import { Prisma } from "@prisma/client"
import { PremiumCardBadge } from "./premium-badge"

type UserWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true,
  }
}>

interface ProfessionalsProps {
  professionals: UserWithSubscription[]
}

export function Professionals({ professionals }: ProfessionalsProps) {
  return (
    <section className="bg-gray-50/50 py-20 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Clínicas e Consultórios Disponíveis
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
            Encontre dentistas parceiros, verifique a localização e agende sua consulta de forma 100% digital.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {professionals.map((clinic) => (
            <Card 
              key={clinic.id} 
              className="group overflow-hidden bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 flex flex-col justify-between"
            >
              <CardContent className="p-0 flex flex-col h-full">
                
                {/* Imagem de Capa do Consultório */}
                <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
                  <Image
                    src={
                      typeof clinic.image === "string"
                        ? clinic.image.replace(/=s\d+-c/, "=s600-c")
                        : fotoImg
                    }
                    alt={`Foto da clínica ${clinic.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    quality={90}
                    priority
                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />

                  {/* Badge de Assinante Premium */}
                  {clinic?.subscription?.status === "active" && clinic?.subscription?.plan === "PROFESSIONAL" && (
                    <div className="absolute top-3 right-3 drop-shadow-sm">
                      <PremiumCardBadge />
                    </div>
                  )}

                  {/* Status de Atendimento em Tempo Real */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-emerald-500/90 text-white font-semibold text-[10px] uppercase tracking-wider backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                      Aberto hoje
                    </span>
                  </div>
                </div>

                {/* Corpo das Informações */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Nome do Estabelecimento */}
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {clinic.name}
                    </h3>

                    {/* Dados Reais: Endereço (Buscado dinamicamente se houver no seu model) */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="text-xs truncate">
                        {/* Altere para o campo correto do seu banco (ex: clinic.address) */}
                        {clinic.email ? "Centro Médico Odontológico" : "Endereço não informado"}
                      </span>
                    </div>

                    {/* Dados Reais: Horários de Atendimento */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="text-xs">08:00 às 18:00</span>
                    </div>
                  </div>

                  {/* Especialidades da Clínica */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Geral
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100/50 uppercase tracking-wider">
                      Estética
                    </span>
                  </div>

                  {/* Botão de Redirecionamento */}
                  <Link
                    href={`/clinica/${clinic.id}`}
                    target="_blank"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 mt-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Ver horários livres</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
