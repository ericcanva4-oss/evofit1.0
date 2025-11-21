// Variável global para armazenar o ID do treino/exercício atual no modal
let currentTreinoId = null;

// Elementos do Modal
let modal, modalTitulo, modalSeries, modalReps, modalCarga, modalTecnica, modalGif;
let inputSeries, inputReps, inputWeight, overloadSuggestion, btnSalvar, validationMessage;

// -----------------------------
// Cronômetro de Descanso
// -----------------------------
let timerInterval = null;
let timeRemaining = 60; // segundos
let isRunning = false;
const defaultTime = 60;

let timerDisplayEl = null;
let startPauseBtnEl = null;
let resetBtnEl = null;
let timerContainerEl = null;

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function updateTimerDisplay() {
    if (!timerDisplayEl) return;
    timerDisplayEl.textContent = formatTime(timeRemaining);
    // cores via classes do Tailwind
    if (timeRemaining <= 10 && timeRemaining > 0) {
        timerDisplayEl.classList.remove('text-red-400', 'text-green-500');
        timerDisplayEl.classList.add('text-yellow-400');
    } else if (timeRemaining === 0) {
        timerDisplayEl.classList.remove('text-yellow-400', 'text-red-400');
        timerDisplayEl.classList.add('text-red-500');
    } else {
        timerDisplayEl.classList.remove('text-yellow-400', 'text-green-500');
        timerDisplayEl.classList.add('text-red-400');
    }
}

function startTimer() {
    if (isRunning) return;
    if (timeRemaining <= 0) timeRemaining = defaultTime;
    isRunning = true;
    if (startPauseBtnEl) {
        startPauseBtnEl.textContent = 'Pausar';
        startPauseBtnEl.classList.remove('bg-green-600');
        startPauseBtnEl.classList.add('bg-orange-600');
    }
    if (timerContainerEl) timerContainerEl.classList.remove('time-up');

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            if (startPauseBtnEl) {
                startPauseBtnEl.textContent = 'Tempo Esgotado!';
                startPauseBtnEl.classList.remove('bg-orange-600');
                startPauseBtnEl.classList.add('bg-red-600');
            }
            if (timerContainerEl) timerContainerEl.classList.add('time-up');
        }
    }, 1000);
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    if (startPauseBtnEl) {
        startPauseBtnEl.textContent = 'Continuar';
        startPauseBtnEl.classList.remove('bg-orange-600');
        startPauseBtnEl.classList.add('bg-green-600');
    }
}

function toggleTimer() {
    if (isRunning) pauseTimer(); else startTimer();
}

function resetTimer(newTime = defaultTime) {
    pauseTimer();
    timeRemaining = newTime;
    updateTimerDisplay();
    if (startPauseBtnEl) {
        startPauseBtnEl.textContent = 'Iniciar';
        startPauseBtnEl.classList.remove('bg-orange-600', 'bg-red-600');
        startPauseBtnEl.classList.add('bg-green-600');
    }
    if (timerContainerEl) timerContainerEl.classList.remove('time-up');
}

function inicializarCronometro() {
    timerDisplayEl = document.getElementById('timer-display');
    startPauseBtnEl = document.getElementById('start-pause-btn');
    resetBtnEl = document.getElementById('reset-btn');
    timerContainerEl = document.querySelector('.bg-gray-800');
    if (!timerDisplayEl) return;
    updateTimerDisplay();
    if (startPauseBtnEl) startPauseBtnEl.addEventListener('click', toggleTimer);
    if (resetBtnEl) resetBtnEl.addEventListener('click', () => resetTimer(defaultTime));
}


// --- Persistência por usuário (localStorage) ---
function getCurrentUsername() {
    const u = sessionStorage.getItem('username');
    return u ? u : 'guest';
}

function getUserStorageKey() {
    return `userProgress_${getCurrentUsername()}`;
}

function loadUserProgress() {
    try {
        const raw = localStorage.getItem(getUserStorageKey());
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error('Erro ao carregar progresso do usuário', e);
        return {};
    }
}

function saveUserProgress(progressObj) {
    try {
        localStorage.setItem(getUserStorageKey(), JSON.stringify(progressObj));
    } catch (e) {
        console.error('Erro ao salvar progresso do usuário', e);
    }
}

// --- Funções Utilitárias para Parsing ---

// Extrai o valor máximo de repetições de um range (ex: "8-12 reps" -> 12)
function parseRepsRange(repsText) {
    const match = repsText.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }
    const singleMatch = repsText.match(/(\d+)/);
    if (singleMatch) {
        return { min: parseInt(singleMatch[1]), max: parseInt(singleMatch[1]) };
    }
    return { min: 0, max: 0 };
}

// Extrai o valor numérico da carga (ex: "20kg (cada)" -> 20.0)
function parseWeight(cargaText) {
    const match = cargaText.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0.0;
}

// --- Lógica Local de Sobrecarga Progressiva (Calculadora) ---
function calcularSugestaoProgressiva(repsFeitas, cargaFeita, nomeExercicio) {
    
    const isTimeBased = modalReps.textContent.toLowerCase().includes('s') || nomeExercicio.toLowerCase().includes('mergulho');
    const isUnilateral = nomeExercicio.toLowerCase().includes('c/ braço') || nomeExercicio.toLowerCase().includes('c/ perna') || nomeExercicio.toLowerCase().includes('unilateral');

    if (isTimeBased) {
        if (nomeExercicio.toLowerCase().includes('mergulho')) {
            const cargaMinima = parseWeight(modalCarga.textContent);
            if (repsFeitas >= 12) {
                const novoPesoExtra = cargaFeita + 2; 
                return `Ótimo! Você bateu o alvo de 12 repetições com ${cargaFeita}kg extra. Sugestão: **Aumente o peso extra para ${novoPesoExtra}kg** e tente manter a faixa de 8-12 repetições.`;
            } else if (repsFeitas >= 8) {
                return `Você atingiu ${repsFeitas} repetições. Sugestão: Mantenha o peso extra de **${cargaFeita}kg** e concentre-se em atingir 12 repetições para garantir sua progressão.`;
            } else {
                return `Você realizou apenas ${repsFeitas} repetições. Sugestão: Se a forma estiver perfeita, mantenha o peso. Se a forma falhou, considere **reduzir o peso extra para ${cargaMinima}kg** para focar na forma correta e atingir pelo menos 8 repetições.`;
            }
        }
        return `Para este exercício técnico/de tempo, o foco é na qualidade do movimento e/ou na resistência. Mantenha a carga de **${cargaFeita}kg** e concentre-se em melhorar a forma ou aumentar o tempo/o número total de séries se for o FST-7 (Dia 5).`;
    }
    
    const REPS_PROGRESSAO = 8;
    const AUMENTO_CARGA_TOTAL = 2.0; 

    if (repsFeitas >= REPS_PROGRESSAO) {
        const novoPeso = cargaFeita + AUMENTO_CARGA_TOTAL; 
        
        let sugestaoProgressao = `Ótimo! Você atingiu ${repsFeitas} repetições com ${cargaFeita}kg. Isso é progresso! Sugestão para o próximo treino: **Aumente a carga para ${novoPeso}kg** e tente manter a técnica e o número de repetições.`;
        
        if (isUnilateral) {
            const novoPesoHalter = cargaFeita + 1.0; 
            sugestaoProgressao = `Ótimo! Você atingiu ${repsFeitas} repetições com ${cargaFeita}kg (cada lado). Sugestão: **Aumente a carga para ${novoPesoHalter}kg em cada halter/perna** e tente manter a forma.`;
        }

        return sugestaoProgressao;

    } else {
        return `Você realizou ${repsFeitas} repetições. Sugestão: Mantenha a carga de **${cargaFeita}kg** e concentre-se em alcançar 8 repetições* com boa forma para garantir sua progressão no próximo ciclo.`;
    }
}

// --- Funções de Controle de Modal e Treino ---

function openModal(nome, series, reps, carga, tecnica, gifUrl, treinoId) {
    currentTreinoId = treinoId;

    modalTitulo.textContent = nome;
    modalSeries.textContent = series;
    modalReps.textContent = reps;
    modalCarga.textContent = carga;
    modalTecnica.textContent = tecnica;
    modalGif.src = gifUrl;

    const { max: defaultReps } = parseRepsRange(reps);
    const defaultWeight = parseWeight(carga);
    
    inputSeries.value = parseInt(series.split('-')[0].trim() || 3); 

    // Preenche valores salvos pelo usuário (se existir) — prioridade aos valores armazenados
    const progress = loadUserProgress();
    const saved = progress && progress[treinoId];
    if (saved && typeof saved === 'object') {
        inputReps.value = saved.reps !== undefined ? saved.reps : (defaultReps || '');
        inputWeight.value = saved.weight !== undefined ? saved.weight : (defaultWeight || '');
    } else {
        inputReps.value = defaultReps || '';
        inputWeight.value = defaultWeight || '';
    }

    overloadSuggestion.classList.add('hidden');
    overloadSuggestion.innerHTML = '';
    validationMessage.classList.add('hidden');
    
    btnSalvar.textContent = "Gerar Sugestão de Treino";
    btnSalvar.classList.remove('bg-green-600');
    btnSalvar.classList.add('bg-red-800');

    modal.classList.add('is-open', 'opacity-100');
    modal.classList.remove('invisible', 'opacity-0', 'hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('is-open', 'opacity-100');
    modal.classList.add('opacity-0', 'invisible', 'hidden');
    document.body.style.overflow = '';
}

function salvarDesempenhoESugestao(idTreino) {
    
    validationMessage.classList.add('hidden');

    if (!inputSeries.value || !inputReps.value || !inputWeight.value) {
        validationMessage.textContent = "Por favor, preencha todos os campos.";
        validationMessage.classList.remove('hidden');
        return;
    }

    const seriesFeitas = parseInt(inputSeries.value);
    const repsFeitas = parseFloat(inputReps.value);
    const cargaFeita = parseFloat(inputWeight.value);
    const nomeExercicio = modalTitulo.textContent;

    // Salva progresso do usuário para este treino (repetições e carga)
    try {
        const progress = loadUserProgress();
        if (!progress || typeof progress !== 'object') {
            // garante que seja um objeto
        }
        progress[currentTreinoId] = progress[currentTreinoId] || {};
        progress[currentTreinoId].reps = repsFeitas;
        progress[currentTreinoId].weight = cargaFeita;
        progress[currentTreinoId].series = seriesFeitas;
        progress[currentTreinoId].updated = Date.now();
        saveUserProgress(progress);
    } catch (e) {
        console.error('Erro ao salvar progresso no salvarDesempenhoESugestao', e);
    }

    const sugestao = calcularSugestaoProgressiva(repsFeitas, cargaFeita, nomeExercicio);

    overloadSuggestion.innerHTML = `
        <h3 class="text-xl font-bold text-red-800 mb-2">Sugestão de Progressão</h3>
        <p class="text-gray-700">${sugestao}</p>
        <p class="mt-4 text-sm text-gray-500">
        </p>
    `;
    overloadSuggestion.classList.remove('hidden');

    btnSalvar.textContent = "Sugestão Gerada!";
    btnSalvar.classList.remove('bg-red-800', 'hover:bg-red-900');
    btnSalvar.classList.add('bg-green-600', 'hover:bg-green-700');
    
    setTimeout(() => {
        btnSalvar.textContent = "Gerar sugestão de Treino";
        btnSalvar.classList.remove('bg-green-600', 'hover:bg-green-700');
        btnSalvar.classList.add('bg-red-800', 'hover:bg-red-900');
    }, 3000);
}

function mostrarTreino(diaId) {
    document.querySelectorAll('.treino-dia').forEach(sec => {
        sec.classList.remove('ativo');
    });
    document.getElementById(diaId).classList.add('ativo');
}

// Inicializa os elementos do modal quando o DOM estiver pronto
function inicializarModal() {
    modal = document.getElementById('performance-modal');
    modalTitulo = document.getElementById('modal-titulo');
    modalSeries = document.getElementById('modal-series');
    modalReps = document.getElementById('modal-reps');
    modalCarga = document.getElementById('modal-carga');
    modalTecnica = document.getElementById('modal-tecnica');
    modalGif = document.getElementById('modal-gif');
    inputSeries = document.getElementById('input-series');
    inputReps = document.getElementById('input-reps');
    inputWeight = document.getElementById('input-weight');
    overloadSuggestion = document.getElementById('overload-suggestion');
    btnSalvar = document.getElementById('btn-salvar');
    validationMessage = document.getElementById('validation-message');

    // Inicializa o cronômetro (elementos do DOM já estão disponíveis aqui)
    inicializarCronometro();

    // Persistência ao editar inputs: salva carga/reps por treino para o usuário
    function persistCurrentInputs() {
        if (!currentTreinoId) return;
        const repsVal = inputReps && inputReps.value ? parseFloat(inputReps.value) : null;
        const weightVal = inputWeight && inputWeight.value ? parseFloat(inputWeight.value) : null;
        const seriesVal = inputSeries && inputSeries.value ? parseInt(inputSeries.value) : null;
        try {
            const progress = loadUserProgress();
            progress[currentTreinoId] = progress[currentTreinoId] || {};
            if (repsVal !== null) progress[currentTreinoId].reps = repsVal;
            if (weightVal !== null) progress[currentTreinoId].weight = weightVal;
            if (seriesVal !== null) progress[currentTreinoId].series = seriesVal;
            progress[currentTreinoId].updated = Date.now();
            saveUserProgress(progress);
        } catch (e) {
            console.error('Erro ao persistir inputs', e);
        }
    }

    if (inputReps) {
        inputReps.addEventListener('change', persistCurrentInputs);
        inputReps.addEventListener('blur', persistCurrentInputs);
    }
    if (inputWeight) {
        inputWeight.addEventListener('change', persistCurrentInputs);
        inputWeight.addEventListener('blur', persistCurrentInputs);
    }

    // Adicionar event listeners aos botões registrar
    let exercicioCounter = {};
    document.querySelectorAll('.btn-registrar').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const nome = btn.getAttribute('data-nome');
            const series = btn.getAttribute('data-series');
            const reps = btn.getAttribute('data-reps');
            const carga = btn.getAttribute('data-carga');
            const tecnica = btn.getAttribute('data-tecnica');
            const gifUrl = btn.getAttribute('data-gif-url');
            const diaId = btn.closest('.treino-dia').getAttribute('data-treino-id');
            
            // Gera um ID único para cada exercício: "dia_<diaId>_exercicio_<nome_sanitizado>"
            // ou usa o nome do exercício como chave única por dia
            const treinoId = `dia_${diaId}_${nome.replace(/\s+/g, '_')}`;

            openModal(nome, series, reps, carga, tecnica, gifUrl, treinoId);
        });
    });

    // Fecha o modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Mostra o Dia 1 por padrão
    mostrarTreino('dia1');

    // Funcionalidade do Menu Hambúrguer
    const menuToggle = document.getElementById('menu-toggle');
    const menuDropdown = document.getElementById('menu-dropdown');
    const menuLogout = document.getElementById('menu-logout');
    const menuCategorias = document.querySelectorAll('.menu-categoria');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('hidden');
    });

    menuCategorias.forEach(categoria => {
        categoria.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const diaId = categoria.getAttribute('href').substring(1);
            menuDropdown.classList.add('hidden');
            setTimeout(() => {
                mostrarTreino(diaId);
            }, 50);
        });
    });

    menuLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        sessionStorage.removeItem('loggedIn');
        location.replace('login.html');
    });

    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.add('hidden');
        }
    });
}

// Executa quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', inicializarModal);
