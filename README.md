# 📋 EVO FITY - Estrutura de Arquivos

## Arquivo: `index.html` (701 linhas)
O arquivo principal agora é bem mais limpo e contém apenas:
- **Header** com menu hambúrguer
- **Estrutura HTML** dos 5 dias de treino com todos os exercícios
- **Modal** para registro de desempenho
- **Autenticação** via sessionStorage
- **Scripts externos** referenciados

## Arquivo: `treinos.js` (Nova organização)
Todo o **JavaScript** agora está centralizado em um arquivo externo:
- ✅ Funções de modal (abrir, fechar)
- ✅ Lógica de sugestão progressiva
- ✅ Navegação entre dias
- ✅ Menu hambúrguer (abrir, fechar, click em itens)
- ✅ Logout
- ✅ Parsing de dados (reps, carga)

## Arquivo: `login.html`
Permanece inalterado com a tela de login e autenticação.

---

## ✨ Benefícios da Nova Estrutura

1. **Arquivo mais leve**: `index.html` reduzido de 1063 para 701 linhas (-34%)
2. **Manutenção facilitada**: JavaScript centralizado em um único arquivo
3. **Melhor organização**: Separação clara entre HTML (estrutura) e JS (lógica)
4. **Performance**: O código é carregado de forma otimizada com `defer`
5. **Fácil atualização**: Mudanças no JavaScript não afetam a estrutura HTML

---

## 🚀 Como Usar

A aplicação funciona **exatamente igual** de antes! Nenhuma alteração visual ou funcional.

1. Abra `index.html` em um navegador
2. Faça login (usuário: **eric**, senha: **senha123**)
3. Use o menu hambúrguer para navegar entre os dias
4. Clique em "Registrar Desempenho" para abrir o modal
5. Preencha os dados e veja as sugestões de progressão

---

## 📁 Estrutura de Diretórios

```
academia 2.0/
├── index.html          (HTML principal - estrutura)
├── login.html          (Tela de login)
└── treinos.js          (JavaScript - toda a lógica)
```

Simples e eficiente! 💪
