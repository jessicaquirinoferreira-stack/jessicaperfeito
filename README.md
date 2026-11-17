# Jéssica Perfeito | Imóveis (CRECI 78861)

Site público institucional imobiliário e painel administrativo privado de **Jéssica Perfeito | Imóveis**, com foco em imóveis e empreendimentos no Rio de Janeiro (Porto Maravilha e Residencial Heitor dos Prazeres).

## Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), React Router
- **Componentes Visuais**: React Bits (`SplitText`, `ShinyText`, `TiltedCard`, `Magnet`), Magic UI (`BlurFade`, `ShimmerButton`, `BorderBeam`, `Particles`, `NumberTicker`, `WordRotate`), Aceternity UI (`Spotlight`, `AuroraBackground`, `TextGenerateEffect`, `ParallaxFrame`), 21st.dev (`StoryShowcaseAccordion`)
- **Backend / Banco / Auth**: Firebase Authentication + Cloud Firestore (`firebase-applet-config.json`, `firestore.rules`)
- **Mídia**: Vercel Blob (`@vercel/blob` em `/api/upload` com fallback local no preview)
- **SEO & LGPD**: `robots.txt`, `sitemap.xml`, OpenGraph, Schema.org (`RealEstateAgent`), tags GA4/GTM/Search Console configuráveis no painel e consentimento LGPD.

## Instalação Local
```bash
npm install
npm run dev
```

O servidor inicia na porta `3000`.

## Configuração do Firebase e Primeiro Admin
1. A configuração do projeto Firebase já está vinculada automaticamente em `firebase-applet-config.json` e as regras endurecidas estão em `firestore.rules`.
2. Para habilitar o login administrativo por **E-mail/Senha** (`admin@x.com` / `admin4321`):
   - No Console do Firebase do projeto, acesse **Authentication → Sign-in method** e ative **E-mail/senha**.
   - Acesse `/admin` no site e entre com `admin@x.com` / `admin4321` (a conta é provisionada automaticamente no primeiro acesso se ainda não existir, além de semear os dados iniciais no Firestore).
   - Alternativamente, você também pode entrar via **Google Sign-In** com o e-mail autorizado.

## Landing Pages e Landing Page Premium Exclusiva
- Rotas compartilháveis:
  - `/oportunidade/porto-maravilha` *(Landing Page Premium Exclusiva)*
  - `/oportunidade/heitor-dos-prazeres`
  - `/campanha/novo-lar`
- O painel administrativo garante que **apenas 1 Landing Page** por vez possua o modo Premium Showcase ativo.

## Build e Deploy (Vercel)
```bash
npm run lint
npm run build
```
Configure `BLOB_READ_WRITE_TOKEN` nas variáveis de ambiente da Vercel para uploads diretos no Vercel Blob.
