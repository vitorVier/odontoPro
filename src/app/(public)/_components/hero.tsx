import { Button } from "@/components/ui/button";
import Image from "next/image";
import doctorImg from '../../../../public/doctor-hero.png'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-linear-to-b from-emerald-50/50 via-white to-white overflow-hidden">
      {/* Elemento Decorativo Odontológico Sutil */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Lado Esquerdo: Conteúdo */}
          <article className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag / Badge de Confiança */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
              <span>Plataforma Líder em Saúde Bucal & Geral</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Encontre o dentista ideal e <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-4">sorria com confiança</span>.
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Conectamos você aos melhores profissionais e clínicas odontológicas da sua região. Agende consultas de limpeza, clareamento e ortodontia em poucos cliques.
            </p>

            {/* CTAs e Indicadores de Prova Social */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 px-8 py-6 text-base font-semibold rounded-xl w-full sm:w-auto transition-all duration-200 hover:scale-[1.02]"
              >
                Encontrar uma clínica
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </article>

          {/* Lado Direito: Imagem com Elementos Flutuantes */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Card Flutuante de Agendamento */}
              <div className="absolute -bottom-4 -left-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Agendamento online</p>
                  <p className="text-sm font-bold text-gray-800">Confirmação Imediata</p>
                </div>
              </div>

              <Image
                src={doctorImg}
                alt="Profissional de saúde sorrindo em atendimento"
                width={420}
                height={500}
                className="object-contain w-full h-auto drop-shadow-md rounded-2xl"
                quality={100}
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}