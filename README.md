# 🗳️ Sistema de Votação — Vereador Mirim 2026

Aplicação web de votação online desenvolvida no **SENAI – Otacílio Costa**.

## Sobre

Permite que alunos votem em candidatos a Vereador Mirim por meio de um fluxo simples e seguro: validação de CPF, seleção de escola e confirmação do voto. O sistema impede votos duplicados automaticamente.

## Funcionalidades

**Votação**
- Validação de CPF com algoritmo oficial
- Seleção de escola
- Exibição do candidato com foto e número
- Confirmação de voto com bloqueio de duplicidade

**Painel Administrativo** (`/admin`)
- Cadastro de escolas
- Cadastro de candidatos com foto, número e escola
- Resultados em tempo real
- Listagem de votos com CPF mascarado

## Tecnologias

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/) (banco de dados PostgreSQL, storage e tempo real)

## Como rodar localmente

**1. Clone o repositório**
```bash
git clone https://github.com/LemosMoroni/sistemavotosSENAI.git
cd sistemavotosSENAI
```

**2. Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase e a senha do painel admin:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
VITE_ADMIN_SENHA=sua-senha
```

**3. Configure o banco de dados**

Execute o arquivo `../supabase-setup.sql` no SQL Editor do Supabase e crie o bucket `fotos-candidatos` (público) em Storage.

**4. Instale e rode**
```bash
npm install
npm run dev
```

Acesse em: `http://localhost:5173`

## Estrutura

```
src/
├── pages/
│   ├── PaginaCPF.jsx         # Entrada do eleitor
│   ├── PaginaEscola.jsx      # Seleção de escola
│   ├── PaginaCandidato.jsx   # Votação
│   ├── PaginaSucesso.jsx     # Confirmação
│   ├── AdminLogin.jsx        # Login do painel
│   └── PainelAdmin.jsx       # Painel administrativo
├── components/admin/
│   ├── GerenciarCandidatos.jsx
│   ├── GerenciarEscolas.jsx
│   ├── VisualizarResultados.jsx
│   └── ListaVotos.jsx
└── services/
    └── supabase.js
```

---

Desenvolvido no **SENAI – Correia Pinto por Vitor Lemos Moroni**
