export const CURRENT_VERSION = '2.30.0';

export const CHANGELOG = {
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
