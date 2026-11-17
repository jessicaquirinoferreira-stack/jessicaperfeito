import React, { useEffect } from 'react';
import { useSite } from '../context/SiteContext';

export const PrivacidadePage: React.FC = () => {
  const { settings } = useSite();

  useEffect(() => {
    document.title = `Política de Privacidade e LGPD | ${settings.brandName}`;
  }, [settings.brandName]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
        Transparência e LGPD
      </p>
      <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32]">
        Política de Privacidade e Proteção de Dados
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#0B1B32]/80">
        <p>{settings.privacyNotice}</p>

        <section>
          <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
            1. Dados coletados e finalidade
          </h2>
          <p className="mt-2">
            Quando você preenche formulários de contato ou agendamento de visita, coletamos nome, telefone, e-mail (quando informado), interesse imobiliário e parâmetros de origem da navegação (UTM) com a finalidade exclusiva de retornar seu atendimento comercial.
          </p>
        </section>

        <section>
          <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
            2. Armazenamento e segurança
          </h2>
          <p className="mt-2">
            Os registros de leads e solicitações de visita são protegidos por regras de segurança no banco de dados Firebase Firestore com acesso restrito exclusivamente à administração autenticada do site {settings.brandName} ({settings.creci}).
          </p>
        </section>

        <section>
          <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
            3. Seus direitos (LGPD)
          </h2>
          <p className="mt-2">
            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a atualização, confirmação ou exclusão dos seus dados de contato a qualquer momento pelos canais oficiais de atendimento.
          </p>
        </section>
      </div>
    </div>
  );
};
