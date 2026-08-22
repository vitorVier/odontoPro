import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from './_components/hero'
import { Professionals } from "./_components/professionals";
import { getProfessionals } from "./_data-access/get-professionals";

export const revalidate = 120; // 120 segundos = 2 minutos.

export default async function Home() {

  const professionals = await getProfessionals();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div>
        <section id="hero" className="scroll-mt-20">
          <Hero />
        </section>

        <section id="profissionais" className="scroll-mt-20">
          <Professionals professionals={professionals || []} />
        </section>

        <Footer />
      </div>
    </div>
  )
}