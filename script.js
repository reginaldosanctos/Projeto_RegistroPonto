// Objeto para armazenar os horários de ponto organizados por data
const registrosPorData = {};

// Função para registrar um ponto
const registrarPonto = (tipo) => {
    const dataInput = document.getElementById('data').value;
    const horaInput = document.getElementById('hora').value;

    if (!dataInput || !horaInput) {
        alert('Por favor, preencha a data e a hora.');
        return;
    }

    // Usa strings para armazenar data e hora de forma consistente
    const dataHora = `${dataInput}T${horaInput}`;

    // Inicializa o registro da data, se não existir
    if (!registrosPorData[dataInput]) {
        registrosPorData[dataInput] = {
            entrada: null,
            pausaAlmoco: null,
            retornoAlmoco: null,
            saida: null,
        };
    }

    // Verifica se já existe um ponto registrado para o tipo selecionado na data atual
    if (registrosPorData[dataInput][tipo]) {
        alert(`O ponto de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} já foi registrado para esta data.`);
        return;
    }

    // Registra o ponto para o tipo selecionado
    registrosPorData[dataInput][tipo] = dataHora;

    // Recalcula e exibe as horas cumpridas e horas extras
    calcularHorasTrabalhadas(dataInput);

    // Verifica se a batida da saída pode ser registrada
    if (tipo === 'saida') {
        if (verificarHorasExtrasExcedidas()) {
            alert('Horas extras excedidas. Por favor, procure o RH.');
            // Remove o registro de saída se as horas extras forem excedidas
            registrosPorData[dataInput][tipo] = null;
            return;
        }
    }

    // Exibe a mensagem de confirmação com a data e hora formatadas
    const dataHoraFormatada = new Date(dataHora).toLocaleString();
    alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada para ${dataHoraFormatada}`);
};

// Função para exibir todos os pontos registrados
const exibirPontosRegistrados = () => {
    const lista = document.getElementById('horarios-list');
    lista.innerHTML = ''; // Limpa a lista antes de atualizar

    // Verifica se há algum ponto registrado
    if (Object.keys(registrosPorData).length === 0) {
        alert('Nenhum ponto registrado.');
        return;
    }

    // Itera sobre cada data e seus pontos registrados
    for (const [data, horarios] of Object.entries(registrosPorData)) {
        const dataLi = document.createElement('li');
        dataLi.textContent = `Data: ${data}`;
        lista.appendChild(dataLi);

        for (const [tipo, horario] of Object.entries(horarios)) {
            if (horario) {
                const li = document.createElement('li');
                const dataHora = new Date(horario);
                li.textContent = `- ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${dataHora.toLocaleTimeString()}`;
                lista.appendChild(li);
            }
        }
    }

    // Recalcula e exibe as horas cumpridas e horas extras somadas
    calcularHorasTotais();
    
    // Exibe a lista
        lista.style.display = 'block';
    } else {
    
    // Esconde a lista se ela já estiver visível
        lista.style.display = 'none';
    }
};

// Função para calcular e exibir as horas trabalhadas e horas extras para uma data específica
const calcularHorasTrabalhadas = (dataInput) => {
    if (!registrosPorData[dataInput]) return;

    const { entrada, pausaAlmoco, retornoAlmoco, saida } = registrosPorData[dataInput];

    if (entrada && saida) {
        // Converte as strings para objetos Date
        const entradaDate = new Date(entrada);
        const saidaDate = new Date(saida);
        let horasTrabalhadas = (saidaDate - entradaDate) / (1000 * 60 * 60); // Conversão de ms para horas

        // Verifica se há pausa para almoço e retorno do almoço
        if (pausaAlmoco && retornoAlmoco) {
            const pausaAlmocoDate = new Date(pausaAlmoco);
            const retornoAlmocoDate = new Date(retornoAlmoco);

            // Subtrai o tempo de pausa do almoço
            const tempoAlmoco = (retornoAlmocoDate - pausaAlmocoDate) / (1000 * 60 * 60); // Conversão de ms para horas
            horasTrabalhadas -= tempoAlmoco;
        }

        const horasNormais = 8; // Considera 8 horas de trabalho normais
        document.getElementById('horas-cumpridas').textContent = horasTrabalhadas.toFixed(2);

        let horasExtras = horasTrabalhadas - horasNormais;
        if (horasExtras < 0) horasExtras = 0;

        document.getElementById('horas-extras').textContent = horasExtras.toFixed(2);
    } else {
        document.getElementById('horas-cumpridas').textContent = "0";
        document.getElementById('horas-extras').textContent = "0";
    }
};

// Função para calcular e exibir as horas totais cumpridas e horas extras somadas
const calcularHorasTotais = () => {
    let totalHorasCumpridas = 0;
    let totalHorasExtras = 0;

    for (const horarios of Object.values(registrosPorData)) {
        const { entrada, pausaAlmoco, retornoAlmoco, saida } = horarios;

        if (entrada && saida) {
            // Converte as strings para objetos Date
            const entradaDate = new Date(entrada);
            const saidaDate = new Date(saida);
            let horasTrabalhadas = (saidaDate - entradaDate) / (1000 * 60 * 60); // Conversão de ms para horas

            // Verifica se há pausa para almoço e retorno do almoço
            if (pausaAlmoco && retornoAlmoco) {
                const pausaAlmocoDate = new Date(pausaAlmoco);
                const retornoAlmocoDate = new Date(retornoAlmoco);

                // Subtrai o tempo de pausa do almoço
                const tempoAlmoco = (retornoAlmocoDate - pausaAlmocoDate) / (1000 * 60 * 60); // Conversão de ms para horas
                horasTrabalhadas -= tempoAlmoco;
            }

            const horasNormais = 8; // Considera 8 horas de trabalho normais
            totalHorasCumpridas += horasTrabalhadas;

            let horasExtras = horasTrabalhadas - horasNormais;
            if (horasExtras < 0) horasExtras = 0;

            totalHorasExtras += horasExtras;
        }
    }

    document.getElementById('horas-cumpridas').textContent = totalHorasCumpridas.toFixed(2);
    document.getElementById('horas-extras').textContent = totalHorasExtras.toFixed(2);
};

// Função para verificar se o limite de horas extras foi excedido
const verificarHorasExtrasExcedidas = () => {
    calcularHorasTotais(); // Recalcula as horas totais e horas extras
    const totalHorasExtras = parseFloat(document.getElementById('horas-extras').textContent);
    return totalHorasExtras > 20;
};
