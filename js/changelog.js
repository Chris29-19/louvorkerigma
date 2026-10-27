export const CURRENT_VERSION = '2.31.2';

export const CHANGELOG = {
    '2.31.2': [
        'Busca IA corrigida: modelos Gemini atualizados',
        'Fallback automático entre modelos da IA (mais estabilidade)'
    ],
    '2.31.1': [
        'Botão Tema alinhado aos demais ícones do rodapé',
        'Rótulo "Tema" restaurado abaixo do ícone sol/lua'
    ],
    '2.31.0': [
        'Chat IA — Busca Inteligente de Músicas (Gemini)',
        'Botão IA no rodapé',
        'Botão Tema movido do header para o rodapé',
        'Seção IA no painel admin para configurar a chave Gemini'
    ],
    '2.30.0': [
        'Rodapé fixo com botões Sugestões, + e Mais',
        'Enviar sugestões diretamente pelo app',
        'Tela Sobre com logo e versão do app',
        'Botão + centralizado no rodapé (admin)',
        'Gerenciar sugestões no painel admin',
        'Seta voltar ao topo reposicionada'
    ],
    '2.20.0': [
        'Swipe para deletar música',
        'Clique na música para trocar',
        'Popup de confirmação ao remover',
        'Período com DD + seletor de mês',
        'Botão WhatsApp simplificado',
        'Correção de bugs diversas'
    ]
};

window.CHANGELOG = { version: CURRENT_VERSION, items: CHANGELOG };
