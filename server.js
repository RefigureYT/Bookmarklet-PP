(function() {
    const MIN_ESPERA_SEGUNDOS = 20;
    const MAX_ESPERA_SEGUNDOS = 75;

    window.rodarBot = true;
    console.log('[BOT]: Para parar a execução a qualquer momento, digite "window.rodarBot = false;" no console e pressione Enter.');

    // Cole aqui o JSON com o gabarito completo.
    const jsonGabarito = [
        // ... (seu JSON completo aqui)
    ];

    /**
     * Tenta resolver a questão atual.
     * @returns {string} Retorna o status da operação:
     * 'RESPONDIDA' - se o bot selecionou uma resposta.
     * 'PULADA' - se a questão já estava respondida ou não foi encontrada.
     * 'ERRO' - se um erro fatal ocorreu.
     */
    function resolverQuestaoAtual() {
        console.log('[BOT]: Procurando questão atual...');
        const questaoElement = document.querySelector('div[chave]');
        if (!questaoElement) {
            console.error('[BOT]: ERRO! Não encontrou o elemento da questão. O bot será encerrado.');
            return 'ERRO';
        }

        const respostaJaMarcada = questaoElement.querySelector('input[type="radio"]:checked');
        if (respostaJaMarcada) {
            console.log('[BOT]: Questão já respondida. Pulando para a próxima sem esperar.');
            return 'PULADA';
        }

        const chaveCompleta = questaoElement.getAttribute('chave');
        const idDaQuestao = chaveCompleta.split('-').pop();
        if (!idDaQuestao) {
            console.error('[BOT]: ERRO! Não conseguiu extrair o ID da questão. O bot será encerrado.');
            return 'ERRO';
        }
        console.log(`[BOT]: Resolvendo questão ID: ${idDaQuestao}`);

        const questaoNoGabarito = jsonGabarito.find(q => String(q.id_da_questao) === idDaQuestao);
        if (!questaoNoGabarito) {
            console.warn(`[BOT]: AVISO! Questão com ID ${idDaQuestao} não encontrada no gabarito. Pulando para a próxima sem esperar.`);
            return 'PULADA';
        }

        const textoRespostaCorreta = Object.values(questaoNoGabarito.alternativa_correta)[0].trim();
        const isRespostaImagem = textoRespostaCorreta.startsWith('[IMAGEM]');
        
        const todasAsAlternativas = questaoElement.querySelectorAll('.MuiFormControlLabel-root');
        let respostaSelecionada = false;

        todasAsAlternativas.forEach(labelElement => {
            let encontrou = false;
            const containerAlternativa = labelElement.nextElementSibling;

            if (isRespostaImagem) {
                const urlImagemCorreta = textoRespostaCorreta.replace('[IMAGEM]', '').trim();
                const imgElement = containerAlternativa?.querySelector('img');
                if (imgElement && imgElement.src === urlImagemCorreta) {
                    encontrou = true;
                }
            } else {
                // --- CORREÇÃO: Torna a busca pelo texto mais flexível ---
                // Pega o texto do '.ql-editor', que funciona mesmo se não houver um <p> dentro.
                const editorElement = containerAlternativa?.querySelector('.ql-editor');
                if (editorElement && editorElement.textContent.trim() === textoRespostaCorreta) {
                    encontrou = true;
                }
            }

            if (encontrou) {
                const inputRadio = labelElement.querySelector('input[type="radio"]');
                if (inputRadio) {
                    inputRadio.click();
                    respostaSelecionada = true;
                    console.log(`[BOT]: Resposta correta para a questão ${idDaQuestao} foi selecionada.`);
                }
            }
        });

        if (!respostaSelecionada) {
            console.warn(`[BOT]: AVISO! Não encontrou a alternativa correspondente para a questão ${idDaQuestao}. Pulando para a próxima sem esperar.`);
            return 'PULADA';
        }
        
        return 'RESPONDIDA';
    }

    async function esperarComParadaDeEmergencia() {
        const tempoDeEspera = Math.floor(Math.random() * (MAX_ESPERA_SEGUNDOS - MIN_ESPERA_SEGUNDOS + 1) + MIN_ESPERA_SEGUNDOS);
        console.log(`[BOT]: Resposta selecionada. Aguardando ${tempoDeEspera} segundos antes de avançar...`);

        for (let i = 0; i < tempoDeEspera; i++) {
            if (!window.rodarBot) {
                console.log('[BOT]: PARADA DE EMERGÊNCIA ACIONADA! O script foi interrompido.');
                return false; 
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return true; 
    }

    function clicarProxima() {
        const proximoBtn = document.querySelector('.MuiBox-root.css-1xaekgw button.css-ell3ie');
        if (proximoBtn && proximoBtn.textContent.includes('Proxima')) {
            console.log('[BOT]: Clicando no botão "Proxima"...');
            proximoBtn.click();
            return true;
        } else {
            console.log('[BOT]: FIM DA PROVA? Não foi possível encontrar o botão "Proxima". Encerrando o bot.');
            return false;
        }
    }

    async function iniciarLoop() {
        console.log('[BOT]: Iniciando loop de resolução automática.');

        while (window.rodarBot) {
            await new Promise(resolve => setTimeout(resolve, 3000));

            const statusResolucao = resolverQuestaoAtual();

            if (statusResolucao === 'ERRO') {
                window.rodarBot = false; 
                break;
            }

            // --- IMPLEMENTAÇÃO: ESPERA CONDICIONAL ---
            // Só espera o tempo longo se a questão tiver sido de fato respondida pelo bot.
            if (statusResolucao === 'RESPONDIDA') {
                const continuou = await esperarComParadaDeEmergencia();
                if (!continuou) break; 
            }
            // Se o status for 'PULADA', o loop continua e clica em "Próxima" imediatamente.

            if (!clicarProxima()) {
                window.rodarBot = false; 
                break;
            }
        }

        if (!window.rodarBot) {
            console.log('[BOT]: Loop encerrado.');
        }
    }

    iniciarLoop();

})();
