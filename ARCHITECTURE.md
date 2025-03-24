# Arquitetura de Contador de Palpites de Nascimento da Chloe

## Stack Tecnológica

- **Framework Frontend**: Next.js 14 (com App Router)
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Firebase Firestore
- **Hospedagem**: Vercel
- **Gerenciamento de Estado**: React Context API com hooks
- **Estilização**: Tailwind CSS (apenas dark mode)
- **Segurança de Tipos**: TypeScript
- **Validação de Formulários**: React Hook Form com Zod
- **Componentes**: Shadcn/UI (para componentes acessíveis de alta qualidade)
- **Cor Primária**: Violet 700

## Estrutura de Diretórios

```text
birthday_bet_counter/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── page.tsx (dashboard de administração)
│   ├── api/
│   │   └── [...] (rotas de API)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (página principal com countdown)
├── components/
│   ├── ui/ (componentes shadcn)
│   ├── auth/ (componentes de autenticação)
│   ├── bets/ (componentes de palpites)
│   │   ├── bet-form.tsx
│   │   ├── bet-card.tsx
│   │   ├── bet-list.tsx
│   │   └── countdown.tsx
│   ├── layout/ (componentes de layout)
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   └── shared/ (componentes compartilhados)
├── lib/
│   ├── firebase/ (configuração do Firebase)
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── config.ts
│   ├── utils/ (funções utilitárias)
│   │   ├── date-utils.ts
│   │   └── countdown-utils.ts
│   └── validators/ (esquemas de validação de formulários)
├── context/
│   ├── auth-context.tsx
│   └── bet-context.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-countdown.ts
│   └── use-toast.ts
├── types/
│   └── index.ts (tipos da aplicação)
└── (... arquivos de configuração)
```

## Descrição das Páginas

### Página Principal (/)

- **Funcionalidade**: Exibir o palpite mais próximo da data atual
- **Componentes**:
  - Countdown centralizado (dias, horas, minutos, segundos)
  - Barra de progresso indicando quanto tempo falta
  - Exibição dos 3 próximos palpites abaixo
  - Botão "Ver todos os palpites"
  - Exibição do(s) ganhador(es) caso o bebê já tenha nascido

### Página de Login (/admin/login)

- **Funcionalidade**: Autenticação de usuários administrativos
- **Componentes**:
  - Formulário de login com email/senha
  - Botão de login com Google
  - Link para página de cadastro
  - Link para retornar à página principal

### Página de Cadastro (/admin/signup)

- **Funcionalidade**: Registro de novos usuários
- **Componentes**:
  - Formulário com campos: Nome Completo, E-mail, Senha, Confirmar Senha
  - Botão de cadastro com Google
  - Mensagem informando que o acesso como admin depende de validação

### Página de Perfil (/admin/profile)

- **Funcionalidade**: Gerenciamento de informações do usuário
- **Componentes**:
  - Formulário para edição de nome
  - Campos desabilitados para usuários do Google (e-mail e senha)
  - Opção para alterar senha (usuários não-Google)

### Página de Administração (/admin)

- **Funcionalidade**: Dashboard administrativo
- **Componentes**:
  - Formulário para cadastro de palpites
  - Lista de palpites cadastrados com opções de edição/exclusão
  - Gerenciamento de usuários e permissões
  - Formulário para definir a data real de nascimento

## Modelos de Dados

### Usuário (User)

```typescript
type User = {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  authProvider: 'google' | 'email';
};
```

### Palpite de Nascimento (BirthGuess)

```typescript
type BirthGuess = {
  id: string;
  personName: string;         // Nome da pessoa que fez o palpite
  guessDate: Timestamp;       // Data palpitada para o nascimento
  comment?: string;           // Comentário opcional sobre o palpite
  createdAt: Timestamp;       // Data de criação do registro
  updatedAt: Timestamp;       // Data de atualização do registro
  contactInfo?: string;       // Informação de contato opcional
};
```

### Configurações da Aplicação (AppSettings)

```typescript
type AppSettings = {
  id: string;
  babyName: string;           // Nome do bebê (Chloe)
  expectedDueDate?: Timestamp; // Data prevista pelo médico (opcional)
  actualBirthDate?: Timestamp; // Data real do nascimento (quando ocorrer)
  winnerGuessIds?: string[];  // IDs dos palpites vencedores (depois que nascer)
  isActive: boolean;          // Se a competição está ativa
  updatedAt: Timestamp;       // Data da última atualização
};
```

## Regras de Segurança do Firestore

```typescript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autenticação básica
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verificação de admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Regras para coleção de usuários
    match /users/{userId} {
      // Usuários autenticados podem ler seus próprios dados
      allow read: if isAuthenticated() && request.auth.uid == userId;
      // Apenas admins podem ler todos os usuários
      allow read: if isAdmin();
      // O primeiro usuário pode se tornar admin
      allow create: if isAuthenticated() && 
                     request.auth.uid == userId &&
                     !exists(/databases/$(database)/documents/users/$(request.auth.uid));
      // Apenas admins podem atualizar status de admin
      allow update: if isAdmin() || 
                     (isAuthenticated() && 
                      request.auth.uid == userId && 
                      !('isAdmin' in request.resource.data));
    }
    
    // Regras para coleção de palpites
    match /birthGuesses/{guessId} {
      // Qualquer pessoa pode ler palpites
      allow read: if true;
      // Apenas admins podem criar, atualizar ou excluir palpites
      allow write: if isAdmin();
    }
    
    // Regras para configurações da aplicação
    match /settings/{settingId} {
      // Qualquer pessoa pode ler configurações
      allow read: if true;
      // Apenas admins podem modificar configurações
      allow write: if isAdmin();
    }
  }
}
```

## Plano de Implementação

### Fase 1: Configuração e Autenticação

#### Tarefa 1.1: Configuração do Projeto

- Inicializar projeto Next.js com TypeScript
- Configurar Tailwind CSS e modo escuro
- Configurar Shadcn/UI com tema personalizado (cor primária: violet-700)
- Integrar Firebase (Authentication e Firestore)

#### Tarefa 1.2: Configuração do Firebase

- Configurar projeto Firebase
- Implementar funções de autenticação
- Estabelecer regras de segurança do Firestore
- Criar coleções iniciais e documentos padrão

#### Tarefa 1.3: Implementação da Autenticação

- Desenvolver páginas de login e cadastro
- Construir funcionalidade de login com Google
- Criar provedor de contexto de autenticação
- Implementar rotas protegidas

#### Tarefa 1.4: Implementação do Perfil de Usuário

- Desenvolver página de perfil
- Implementar edição de informações pessoais
- Adicionar funcionalidade de alteração de senha
- Gerenciar diferentes tipos de autenticação (Google vs. E-mail/Senha)

### Fase 2: Funcionalidade Principal

#### Tarefa 2.1: Página Principal

- Desenvolver componente de countdown
- Criar barra de progresso
- Implementar exibição do palpite mais próximo
- Adicionar lista dos próximos palpites
- Criar link para visualização de todos os palpites

#### Tarefa 2.2: Administração de Palpites

- Criar formulário de cadastro de palpites
- Implementar listagem de todos os palpites
- Desenvolver funcionalidades de edição/exclusão de palpites
- Adicionar função para definir data real de nascimento
- Implementar lógica para determinar vencedor(es)

#### Tarefa 2.3: Administração de Usuários

- Desenvolver interface para gerenciamento de usuários
- Implementar concessão/revogação de permissões administrativas
- Criar sistema de aprovação de novos usuários
- Adicionar funcionalidade de exclusão de usuários

### Fase 3: Refinamento e Finalização

#### Tarefa 3.1: Testes e Otimização

- Realizar testes de usabilidade
- Otimizar desempenho
- Implementar lazy loading e code splitting
- Melhorar acessibilidade

#### Tarefa 3.2: UI/UX Polishing

- Refinar animações e transições
- Melhorar responsividade
- Garantir consistência visual
- Implementar feedback visual para ações do usuário

#### Tarefa 3.3: Implantação

- Configurar deploy contínuo na Vercel
- Estabelecer variáveis de ambiente
- Finalizar configurações de produção
- Monitorar e corrigir bugs
