document.addEventListener('DOMContentLoaded', function () {
    const inputData = document.getElementById('data');
    const selectHorario = document.getElementById('horario');
    const btnWhatsAppAgenda = document.getElementById('btnWhatsAppAgenda');
    const listaRegistros = document.getElementById('listaRegistros');

    // Elementos da Área do ADM
    const btnToggleAdm = document.getElementById('btnToggleAdm');
    const painelSenha = document.getElementById('painelSenha');
    const inputSenha = document.getElementById('inputSenha');
    const btnValidarSenha = document.getElementById('btnValidarSenha');
    const conteudoAdm = document.getElementById('conteudoAdm');
    const btnFecharAdm = document.getElementById('btnFecharAdm');

    // Senha padrão do Administrador (Você pode alterar aqui se quiser)
    const SENHA_ADMIN = "admin123";

    // Horários base das 09:00 às 20:00 (de hora em hora)
    const horariosBase = [
        "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00", 
        "17:00", "18:00", "19:00", "20:00"
    ];

    // Carrega os agendamentos salvos no navegador (localStorage)
    function obterAgendamentos() {
        return JSON.parse(localStorage.getItem('studio_gobetti_agendamentos')) || [];
    }

    // Salva um novo agendamento
    function salvarAgendamento(novoAgendamento) {
        const agendamentos = obterAgendamentos();
        agendamentos.push(novoAgendamento);
        localStorage.setItem('studio_gobetti_agendamentos', JSON.stringify(agendamentos));
    }

    // Renderiza a lista de agendamentos no painel do ADM
    function renderizarRegistros() {
        const agendamentos = obterAgendamentos();
        listaRegistros.innerHTML = '';

        if (agendamentos.length === 0) {
            listaRegistros.innerHTML = '<p class="nenhum-registro">Nenhum horário agendado no momento.</p>';
            return;
        }

        agendamentos.forEach(item => {
            const dataFormatada = item.data.split('-').reverse().join('/');
            const div = document.createElement('div');
            div.className = 'registro-item';
            div.innerHTML = `
                <div class="registro-info">
                    <strong>${item.nome}</strong> (${item.servico})
                </div>
                <div class="registro-data">
                    📅 ${dataFormatada} às ⏰ ${item.horario}
                </div>
            `;
            listaRegistros.appendChild(div);
        });
    }

    // Controle de Exibição do Painel ADM por Senha
    btnToggleAdm.addEventListener('click', function () {
        painelSenha.classList.toggle('oculto');
        conteudoAdm.classList.add('oculto');
        inputSenha.value = '';
    });

    btnValidarSenha.addEventListener('click', function () {
        if (inputSenha.value === SENHA_ADMIN) {
            painelSenha.classList.add('oculto');
            conteudoAdm.classList.remove('oculto');
            renderizarRegistros();
        } else {
            alert('Senha incorreta! Acesso negado.');
            inputSenha.value = '';
        }
    });

    btnFecharAdm.addEventListener('click', function () {
        conteudoAdm.classList.add('oculto');
        inputSenha.value = '';
    });

    // Atualiza o select de horários com base na data escolhida
    function atualizarHorariosDisponiveis() {
        const dataSelecionada = inputData.value;
        selectHorario.innerHTML = '<option value="" disabled selected>Selecione um horário</option>';

        if (!dataSelecionada) {
            selectHorario.innerHTML = '<option value="" disabled selected>Selecione uma data primeiro</option>';
            return;
        }

        // Pega os horários já reservados para esta data específica
        const agendamentos = obterAgendamentos();
        const horariosOcupados = agendamentos
            .filter(item => item.data === dataSelecionada)
            .map(item => item.horario);

        // Filtra os horários removendo os que já foram escolhidos
        const horariosDisponiveis = horariosBase.filter(h => !horariosOcupados.includes(h));

        if (horariosDisponiveis.length === 0) {
            selectHorario.innerHTML = '<option value="" disabled selected>Nenhum horário disponível para esta data</option>';
            return;
        }

        // Preenche o select com os horários livres
        horariosDisponiveis.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            selectHorario.appendChild(option);
        });
    }

    // Evento disparado quando o usuário muda a data
    inputData.addEventListener('change', atualizarHorariosDisponiveis);

    // Ação do Botão de WhatsApp (Salva, registra e abre o WhatsApp)
    btnWhatsAppAgenda.addEventListener('click', function () {
        const nome = document.getElementById('nome').value;
        const servico = document.getElementById('servico').value;
        const data = inputData.value;
        const horario = selectHorario.value;

        if (!nome || !servico || !data || !horario) {
            alert('Por favor, preencha todos os campos antes de confirmar pelo WhatsApp!');
            return;
        }

        // Salva o agendamento
        salvarAgendamento({ nome, servico, data, horario });

        // Formata a data para DD/MM/AAAA
        const dataFormatada = data.split('-').reverse().join('/');

        // Número do WhatsApp do salão
        const telefoneSalao = "5511987488840"; 

        const mensagem = `Olá, gostaria de confirmar meu agendamento no Studio Gobetti:%0A*Nome:* ${nome}%0A*Serviço:* ${servico}%0A*Data:* ${dataFormatada}%0A*Horário:* ${horario}`;
        
        window.open(`https://api.whatsapp.com/send?phone=${telefoneSalao}&text=${mensagem}`, '_blank');
        
        // Limpa o formulário e atualiza os horários disponíveis
        document.getElementById('formAgenda').reset();
        selectHorario.innerHTML = '<option value="" disabled selected>Selecione uma data primeiro</option>';
    });
});