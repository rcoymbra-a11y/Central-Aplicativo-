interface FooterProps {
  brandSubtitle: string;
}

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Kwai', href: 'https://www.kwai.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

export function Footer({ brandSubtitle }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-[#FAFAFA] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-base font-bold text-zinc-900">
              Central de Aplicativos
            </p>
            <p className="mt-1 text-sm text-zinc-600">{brandSubtitle}</p>
          </div>

          <nav aria-label="Redes sociais" className="flex flex-wrap items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:text-zinc-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
            Aviso: Os aplicativos disponíveis nesta vitrine têm caráter educativo, informativo e de
            autoconhecimento, não substituindo acompanhamento médico, nutricional, psicológico ou
            financeiro profissional.
          </p>
        </div>
      </div>
    </footer>
  );
}
