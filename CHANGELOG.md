# Registro de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado

- Planejamento da arquitetura através do documento ARCHITECTURE.md
- Implementação das páginas de login e cadastro (/admin/login e /admin/signup)
- Atualização da Navbar para incluir links de login e cadastro
- Correção do fluxo de autenticação conforme a arquitetura do projeto
- Correção das variáveis CSS para garantir o tema escuro exclusivo em toda a aplicação
- Atualização da página principal conforme especificado no ARCHITECTURE.md:
  - Remoção do formulário de palpites (exclusivo para área de admin)
  - Adição da exibição dos 3 próximos palpites mais próximos
  - Implementação do botão "Ver todos os palpites"
  - Exibição do ganhador quando o bebê já nascer
- Criação da página de listagem de todos os palpites (/guesses):
  - Tabela com ordenação por nome ou data
  - Cálculo de diferença entre o palpite e a data real (quando disponível)
  - Interface responsiva e integrada ao tema da aplicação
- Implementação completa da página de administração (/admin):
  - Formulário para cadastro e edição de palpites
  - Interface para exclusão de palpites com confirmação
  - Funcionalidade para definir a data real de nascimento
  - Exibição do palpite vencedor após definir data real
  - Animação de adição de palpites em massa com feedback visual
- Redesign da página principal:
  - Palpite mais próximo em destaque no centro da página
  - Contador regressivo mostrando dias, horas, minutos e segundos para cada palpite
  - Barra de progresso indicando porcentagem de tempo decorrido até o palpite
  - Exibição dos 3 próximos palpites abaixo do principal
  - Botão discreto "Ver todos os palpites" com ícone visual
- Implementação da página de administração com abas para gerenciar palpites, usuários e aprovações
- Funcionalidade para adicionar palpites em massa diretamente pelo painel administrativo
- Interface melhorada para definir a data real de nascimento, com calendário visual e exibição do vencedor
- Animação visual para adição de palpites em massa, mostrando cada palpite sendo adicionado sequencialmente

## [0.3.0] - 2025-03-15

### Fase 1A: Estrutura Principal e Contagem Regressiva

#### Configuração do Projeto

- Inicializado projeto Next.js 14 com TypeScript
- Configurado TailwindCSS com tema personalizado (cor primária: violet-700)
- Instalado e configurado Shadcn/UI para componentes de interface
- Implementado modo escuro como padrão da aplicação
- **Atualizado**: Configuração do Firebase para usar variáveis de ambiente do arquivo `.env.local`

#### Firebase

- Configurado Firebase Authentication para login com Google
- Implementado Firestore para armazenamento de dados
- Criadas funções de serviço para autenticação e gerenciamento de dados
- Definidos tipos TypeScript para modelagem de dados (BirthGuess, UserProfile, AppSettings)

#### Componentes Principais

- Criado componente de Countdown com barra de progresso
- Implementado formulário de palpites com validação usando Zod
- Adicionado sistema de notificações usando Sonner
- Criado contexto de autenticação para gerenciamento de estado do usuário

#### Páginas

- Implementada página inicial com contador regressivo e formulário de palpites
- Layout principal configurado com modo escuro e suporte para notificações

#### Correções

- Corrigidos erros de lint no documento de arquitetura

### Próximas Etapas

- Implementar página de administração para gerenciamento de palpites
- Adicionar página de perfil de usuário
- Implementar visualização detalhada de todos os palpites

## [0.2.0] - 2025-03-08

### Fase 2: Área de Administração

#### Gerenciamento de Palpites

- Reformulação completa da aplicação para rastrear palpites sobre a data de nascimento da Chloe
- Criação de tipos específicos para `BirthGuess` e `AppSettings` para modelar os dados da aplicação
- Implementação das funções CRUD para gerenciar palpites no Firestore:
  - Criar, listar, atualizar e excluir palpites
  - Determinar automaticamente o palpite mais próximo da data real
  - Registrar a data real de nascimento e calcular o vencedor

#### Interface do Administrador

- Desenvolvimento da página administrativa em `/dashboard/palpites` com:
  - Tabela completa de palpites com ordenação por data
  - Funcionalidade para adicionar novos palpites
  - Sistema para exclusão de palpites existentes
  - Interface para registrar a data real de nascimento quando ocorrer
  - Destaque visual para o palpite vencedor com ícone de troféu

#### Melhorias na Interface do Usuário

- Integração de componentes do Shadcn/ui:
  - Button, Card, Toast, Avatar e Progress
- Criação do componente `Navbar` para navegação entre páginas
- Implementação de layout responsivo para dashboard
- Desenvolvimento de um componente `CountdownTimer` melhorado com:
  - Contagem regressiva animada para a data prevista
  - Barra de progresso visual
  - Suporte para diferentes estados (antes/depois do nascimento)

#### Página Principal

- Redesign completo da página inicial com:
  - Exibição do contador regressivo centralizado
  - Cards para visualização de todos os palpites
  - Destaque para o palpite vencedor (quando aplicável)
  - Integração com o componente de navegação

## Versão [0.1.0] - 2025-03-01

### Configuração Base

#### Configuração do Projeto

- Inicialização do projeto Next.js 14 com TypeScript
- Configuração do Tailwind CSS com tema claro/escuro
- Criação da estrutura de pastas baseada na arquitetura planejada
- Adição de arquivos de configuração do projeto (package.json, tsconfig.json, next.config.js)
- Implementação das configurações de estilo global com CSS variables

#### Integração com Firebase

- Configuração dos serviços do Firebase (Authentication e Firestore)
- Criação dos arquivos de serviço para autenticação
- Implementação de serviços para gerenciamento de perfil de usuário no Firestore
- Configuração do arquivo de exemplo para variáveis de ambiente (.env.local.example)

#### Autenticação

- Implementação do contexto de autenticação para gerenciar estado de usuário
- Criação de hooks personalizados para ações de autenticação
- Desenvolvimento de páginas de autenticação:
  - Página de login com suporte a email/senha e Google
  - Página de cadastro
  - Página de recuperação de senha
- Implementação de middleware para proteção de rotas

#### Interface do Usuário

- Criação de componentes base da UI (buttons, inputs, labels)
- Implementação de componentes específicos para autenticação
- Desenvolvimento do layout principal da aplicação
- Criação do layout específico para páginas de autenticação

#### Área do Usuário

- Implementação da página de dashboard
- Criação da página de perfil do usuário com:
  - Exibição de informações do usuário
  - Funcionalidade para edição de perfil
  - Estrutura para alteração de senha e exclusão de conta

#### Documentação

- Criação do arquivo README.md com documentação completa
- Adição do CHANGELOG.md para registro de alterações

## [0.0.3] - 2025-02-23

### Adicionado

- Sistema de aprovação de usuários
- Página de administração com abas para gerenciar palpites, usuários e aprovações
- Funcionalidade para adicionar palpites em massa diretamente pelo painel administrativo
- Interface melhorada para definir a data real de nascimento, com calendário visual e exibição do vencedor
- Animação visual para adição de palpites em massa, mostrando cada palpite sendo adicionado sequencialmente
