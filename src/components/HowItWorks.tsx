const STEPS = [
  {
    number: '01',
    title: 'Escolha o aplicativo',
    description:
      'Escolha o aplicativo ideal para o seu momento ou necessidade na vitrine.',
  },
  {
    number: '02',
    title: 'Acesso imediato',
    description:
      'Finalize pelo link seguro e receba seu acesso para usar online sem complicação.',
  },
  {
    number: '03',
    title: 'Plano ou diagnóstico em PDF',
    description:
      'Preencha as etapas rápidas e baixe seu plano ou diagnóstico em PDF.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-t border-zinc-200 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-balance text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Como funciona
          </h2>
          <p className="mt-2.5 text-base text-zinc-600">
            Do acesso à entrega do seu diagnóstico personalizado em três etapas diretas.
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-1 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-[#FAFAFA] md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map((step) => (
            <li key={step.number} className="flex flex-col justify-between p-6 sm:p-7">
              <div>
                <span className="font-display text-2xl font-bold tabular-nums text-blue-800">
                  {step.number}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
