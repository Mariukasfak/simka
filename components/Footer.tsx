import Link from "next/link";
import type { Route } from "next";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-brand-dark tracking-wider uppercase">
              Apie Siemka.lt
            </h3>
            <p className="mt-4 text-base text-gray-500">
              Kurkite unikalius marškinėlius ir džemperius su savo dizainu.
              Aukštos kokybės spauda ir medžiagos užtikrina ilgaamžiškumą.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-dark tracking-wider uppercase">
              Navigacija
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-base text-gray-500 hover:text-brand-primary"
                >
                  Pagrindinis
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-base text-gray-500 hover:text-brand-primary"
                >
                  Produktai
                </Link>
              </li>
              <li>
                <Link
                  href={"/about" as Route}
                  className="text-base text-gray-500 hover:text-brand-primary"
                >
                  Apie mus
                </Link>
              </li>
              <li>
                <Link
                  href={"/contact" as Route}
                  className="text-base text-gray-500 hover:text-brand-primary"
                >
                  Kontaktai
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-dark tracking-wider uppercase">
              Kontaktai
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="text-base text-gray-500">Tel.: +370 600 00000</li>
              <li>
                <a
                  href="mailto:info@siemka.lt"
                  className="text-base text-gray-500 hover:text-brand-primary"
                >
                  info@siemka.lt
                </a>
              </li>
              <li className="text-base text-gray-500">Vilnius, Lietuva</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} Siemka.lt. Visos teisės saugomos.
          </p>
        </div>
      </div>
    </footer>
  );
}
