import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import fotoImg from '../../../../public/foto1.png'
import Link from "next/link"
import { ArrowRight, MapPin, Star } from "lucide-react"
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
    <section className="bg-gray-50/60 py-20 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Clínicas e Consultórios Disponíveis
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Selecione uma clínica especializada para ver horários livres e realizar seu agendamento.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {professionals.map((clinic) => (
            <Card 
              key={clinic.id} 
              className="group overflow-hidden bg-white border border-gray-200/80 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <CardContent className="p-0 flex flex-col h-full">
                
                {/* Header da Imagem */}
                <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={clinic.image ?? fotoImg}
                    alt={`Foto do estabelecimento ${clinic.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* Badge de Selo Premium / Verificado */}
                  {clinic?.subscription?.status === "active" && clinic?.subscription?.plan === "PROFESSIONAL" && (
                    <div className="absolute top-3 right-3">
                      <PremiumCardBadge />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                    <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      4.9 (120+)
                    </span>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {clinic.name}
                      </h3>
                    </div>
                  </div>

                  {/* Tags Temáticas Odontológicas */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                      Clareamento
                    </span>
                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                      Ortodontia
                    </span>
                  </div>

                  {/* Botão de Ação */}
                  <Link
                    href={`/clinica/${clinic.id}`}
                    target="_blank"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-200 mt-auto"
                  >
                    <span>Agendar horário</span>
                    <ArrowRight className="w-4 h-4" />
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