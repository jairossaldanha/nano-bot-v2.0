# Plano: Subagent Personas (Option B)

## Objetivo
Transformar a arquitetura efêmera dos subagentes em um sistema baseado em **Templates/Personas**. O agente principal poderá instanciar subagentes com perfis específicos (ex: "researcher", "coder"), selecionando habilidades e comportamentos dedicados para cada contexto. A WebUI mostrará uma galeria visual dessas personas.

## Fases de Implementação

### Fase 1: Core Backend & Carregamento de Templates
- **Nova Estrutura:** Criar `SubagentTemplate` (nome, descrição, skills permitidas, modelo, prompt).
- **Armazenamento:** Definir onde as personas viverão (ex: pasta `workspace/subagents/*.yaml` ou na configuração central).
- **Gerenciador:** Atualizar `SubagentManager` para carregar esses templates em memória.

### Fase 2: SpawnTool & Injeção de Contexto
- Atualizar `SpawnTool` para aceitar um argumento opcional `template`.
- Modificar o sistema de build de prompts para injetar o `system_prompt_override` do template.
- Filtrar `ToolRegistry` do subagente para injetar *apenas* as skills definidas no template (com fallback para as defaults se o template não especificar, ou restrição estrita).

### Fase 3: Integração WebUI
- **API Endpoint:** Criar `/api/subagents/templates` em `websocket.py` (ou `web/`) para listar os templates.
- **Frontend (SubagentsPage.tsx):** 
  - Remover a visão estática atual.
  - Implementar uma **Templates Gallery** (cards com ícones, nome, modelo, skills).
  - Adicionar status visual se há subagentes rodando no momento para cada persona (opcional na v1, mas bom ter).

### Fase 4: Automação pelo Classifier
- Adicionar lógica no Agent principal ou no `SpawnTool` para que o próprio modelo use o `TaskClassification` (já existente em `classifier.py`) para sugerir a persona correta caso o usuário não especifique.

---

## Questões em Aberto (Socratic Gate)
Antes de escrever o código, precisamos alinhar os Edge Cases.
