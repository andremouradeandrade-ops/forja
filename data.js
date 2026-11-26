// Forja — dados iniciais. As fichas podem ser editadas no app; isto é só o ponto de partida.
window.FORJA_SEED = {
  fichas: [
    {
      id: 'peito', letra: 'A', nome: 'Peito', subtitulo: 'Peito e tríceps', tipo: 'forca', ilustracao: 'peito', descanso: 90, minutos: 55,
      musculos: ['Peitoral', 'Ombros', 'Tríceps'], equipamentos: ['Barra', 'Halteres', 'Polia', 'Máquinas'],
      exercicios: [
        { id: 'supino-reto', nome: 'Supino reto', grupo: 'Peitoral', equip: 'Barra', series: 4, reps: 8, kg: 70, img: 'supino-reto' },
        { id: 'supino-inclinado', nome: 'Supino inclinado', grupo: 'Peitoral superior', equip: 'Barra', series: 4, reps: 10, kg: 50, img: 'supino' },
        { id: 'crucifixo-maquina', nome: 'Crucifixo na máquina', grupo: 'Peitoral', equip: 'Máquina', series: 3, reps: 12, kg: 40, img: 'crucifixo-maquina' },
        { id: 'crossover', nome: 'Crossover', grupo: 'Peitoral', equip: 'Polia', series: 3, reps: 12, kg: 15, img: 'crossover' },
        { id: 'flexao', nome: 'Flexão de braço', grupo: 'Peitoral', equip: 'Peso corporal', series: 3, reps: 15, kg: 0, img: 'flexao' },
        { id: 'triceps-corda', nome: 'Tríceps corda', grupo: 'Tríceps', equip: 'Polia', series: 3, reps: 12, kg: 25, img: 'triceps-corda' }
      ]
    },
    {
      id: 'costas', letra: 'B', nome: 'Costas', subtitulo: 'Costas', tipo: 'forca', ilustracao: 'costas', descanso: 90, minutos: 50,
      musculos: ['Dorsais', 'Trapézio', 'Lombar'], equipamentos: ['Máquinas', 'Barra', 'Polia', 'Halteres'],
      exercicios: [
        { id: 'puxada-frontal', nome: 'Puxada frontal', grupo: 'Dorsais', equip: 'Máquina', series: 4, reps: 10, kg: 60, img: 'puxada-frontal' },
        { id: 'remada-curvada', nome: 'Remada curvada', grupo: 'Dorsais', equip: 'Barra', series: 4, reps: 8, kg: 50, img: 'remada-curvada' },
        { id: 'remada-baixa', nome: 'Remada baixa', grupo: 'Dorsais', equip: 'Polia', series: 3, reps: 12, kg: 55, img: 'remada-baixa' },
        { id: 'pulldown', nome: 'Pulldown braços estendidos', grupo: 'Dorsais', equip: 'Polia', series: 3, reps: 12, kg: 30, img: 'pulldown' },
        { id: 'encolhimento-halteres', nome: 'Encolhimento', grupo: 'Trapézio', equip: 'Halteres', series: 3, reps: 12, kg: 24, img: 'encolhimento-halteres' },
        { id: 'hiperextensao', nome: 'Hiperextensão lombar', grupo: 'Lombar', equip: 'Banco', series: 3, reps: 15, kg: 0, img: 'hiperextensao' }
      ]
    },
    {
      id: 'pernas', letra: 'C', nome: 'Pernas', subtitulo: 'Pernas', tipo: 'forca', ilustracao: 'pernas', descanso: 90, minutos: 60,
      musculos: ['Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha'], equipamentos: ['Barra', 'Máquinas', 'Halteres'],
      exercicios: [
        { id: 'agachamento', nome: 'Agachamento livre', grupo: 'Quadríceps', equip: 'Barra', series: 4, reps: 8, kg: 80, img: 'agachamento' },
        { id: 'leg-press', nome: 'Leg press 45°', grupo: 'Quadríceps', equip: 'Máquina', series: 4, reps: 12, kg: 180, img: 'legpress' },
        { id: 'extensora', nome: 'Cadeira extensora', grupo: 'Quadríceps', equip: 'Máquina', series: 3, reps: 12, kg: 45, img: 'extensora' },
        { id: 'stiff', nome: 'Stiff', grupo: 'Posterior', equip: 'Barra', series: 3, reps: 10, kg: 50, img: 'stiff' },
        { id: 'mesa-flexora', nome: 'Mesa flexora', grupo: 'Posterior', equip: 'Máquina', series: 3, reps: 12, kg: 35, img: 'mesaflexora' },
        { id: 'panturrilha', nome: 'Panturrilha em pé', grupo: 'Panturrilha', equip: 'Máquina', series: 4, reps: 15, kg: 60, img: 'panturrilha' },
        { id: 'afundo', nome: 'Afundo com halteres', grupo: 'Glúteos', equip: 'Halteres', series: 3, reps: 10, kg: 16, img: 'afundo' }
      ]
    },
    {
      id: 'ombros', letra: 'D', nome: 'Ombros', subtitulo: 'Ombros', tipo: 'forca', ilustracao: 'ombros', descanso: 75, minutos: 45,
      musculos: ['Deltoides', 'Trapézio'], equipamentos: ['Halteres', 'Máquina', 'Barra'],
      exercicios: [
        { id: 'desenvolvimento', nome: 'Desenvolvimento com halteres', grupo: 'Deltoides', equip: 'Halteres', series: 4, reps: 8, kg: 20 },
        { id: 'elevacao-lateral', nome: 'Elevação lateral', grupo: 'Deltoide lateral', equip: 'Halteres', series: 4, reps: 12, kg: 10 },
        { id: 'elevacao-frontal', nome: 'Elevação frontal', grupo: 'Deltoide anterior', equip: 'Halteres', series: 3, reps: 12, kg: 8 },
        { id: 'crucifixo-inverso', nome: 'Crucifixo inverso', grupo: 'Deltoide posterior', equip: 'Máquina', series: 4, reps: 12, kg: 30 },
        { id: 'encolhimento-barra', nome: 'Encolhimento com barra', grupo: 'Trapézio', equip: 'Barra', series: 3, reps: 12, kg: 60 }
      ]
    },
    {
      id: 'bracos', letra: 'E', nome: 'Braços', subtitulo: 'Braços', tipo: 'forca', ilustracao: 'bracos', descanso: 60, minutos: 45,
      musculos: ['Bíceps', 'Tríceps', 'Antebraço'], equipamentos: ['Barra', 'Barra W', 'Halteres', 'Polia'],
      exercicios: [
        { id: 'rosca-direta', nome: 'Rosca direta', grupo: 'Bíceps', equip: 'Barra', series: 4, reps: 10, kg: 30 },
        { id: 'triceps-testa', nome: 'Tríceps testa', grupo: 'Tríceps', equip: 'Barra W', series: 4, reps: 10, kg: 25 },
        { id: 'rosca-martelo', nome: 'Rosca martelo', grupo: 'Bíceps', equip: 'Halteres', series: 3, reps: 12, kg: 14 },
        { id: 'triceps-corda-b', nome: 'Tríceps corda', grupo: 'Tríceps', equip: 'Polia', series: 3, reps: 12, kg: 25, img: 'triceps-corda' },
        { id: 'rosca-concentrada', nome: 'Rosca concentrada', grupo: 'Bíceps', equip: 'Halter', series: 3, reps: 12, kg: 12 },
        { id: 'rosca-punho', nome: 'Rosca de punho', grupo: 'Antebraço', equip: 'Barra', series: 3, reps: 15, kg: 20 }
      ]
    },
    {
      id: 'abdomen', letra: 'F', nome: 'Abdômen', subtitulo: 'Core', tipo: 'forca', ilustracao: 'abdomen', descanso: 45, minutos: 25,
      musculos: ['Reto abdominal', 'Oblíquos', 'Lombar'], equipamentos: ['Peso corporal', 'Polia', 'Roda'],
      exercicios: [
        { id: 'abdominal-infra', nome: 'Abdominal infra', grupo: 'Reto abdominal', equip: 'Banco', series: 3, reps: 15, kg: 0 },
        { id: 'prancha', nome: 'Prancha', grupo: 'Core', equip: 'Peso corporal', series: 3, reps: 45, kg: 0, unidade: 's' },
        { id: 'abdominal-polia', nome: 'Abdominal na polia', grupo: 'Reto abdominal', equip: 'Polia', series: 3, reps: 12, kg: 30 },
        { id: 'abdominal-obliquo', nome: 'Abdominal oblíquo', grupo: 'Oblíquos', equip: 'Peso corporal', series: 3, reps: 15, kg: 0 },
        { id: 'roda-abdominal', nome: 'Roda abdominal', grupo: 'Core', equip: 'Roda', series: 3, reps: 10, kg: 0 }
      ]
    },
    {
      id: 'corrida', letra: '', nome: 'Corrida', subtitulo: 'Intervalado', tipo: 'cardio', ilustracao: 'corrida', descanso: 0, minutos: 32,
      distanciaAlvo: 5, ritmoAlvo: '5:40',
      musculos: ['Leve · Z2', 'Forte · Z4'], equipamentos: ['Tênis', 'Relógio'],
      etapas: [
        { id: 'aquecimento', nome: 'Aquecimento', detalhe: 'Trote leve · Z2', valor: '10 min', alvo: '6:30 /km', icone: 'caminhada' },
        { id: 'tiros', nome: 'Tiros', detalhe: 'Forte · Z4', valor: '5 × 400 m', alvo: '4:50 /km', icone: 'corrida' },
        { id: 'recuperacao', nome: 'Recuperação', detalhe: 'Caminhada entre tiros', valor: '5 × 90 s', alvo: '—', icone: 'tempo' },
        { id: 'continuo', nome: 'Ritmo contínuo', detalhe: 'Moderado · Z3', valor: '2 km', alvo: '5:40 /km', icone: 'corrida' },
        { id: 'desaquecimento', nome: 'Desaquecimento', detalhe: 'Caminhada', valor: '5 min', alvo: '—', icone: 'caminhada' }
      ]
    }
  ],

  // Como fazer: passos curtos. Exercícios sem entrada aqui mostram só músculos e equipamento.
  guias: {
    'supino-reto': { passos: ['Deite no banco com os olhos sob a barra e os pés firmes no chão.', 'Desça a barra até a linha do peito, cotovelos a uns 45° do tronco.', 'Empurre para cima até quase estender os cotovelos.'], dica: 'Escápulas juntas e para baixo durante todo o movimento.', erro: 'Quicar a barra no peito.' },
    'supino-inclinado': { passos: ['Ajuste o banco entre 30° e 45° e apoie bem as costas.', 'Desça a barra até a parte de cima do peito, devagar.', 'Empurre para cima até quase estender os cotovelos.'], dica: 'Mantenha os cotovelos a 45° do tronco, não abertos a 90°.', erro: 'Arquear demais a lombar.' },
    'crucifixo-maquina': { passos: ['Ajuste o banco para as alças ficarem na altura do peito.', 'Com os cotovelos levemente dobrados, feche os braços à frente.', 'Volte devagar até sentir o peito alongar.'], dica: 'O movimento é de abraço, não de empurrar.' },
    'crossover': { passos: ['Polias no alto, um pé à frente, tronco levemente inclinado.', 'Traga as mãos para baixo e para o centro, à frente do quadril.', 'Volte controlando a carga.'], dica: 'Cotovelos fixos e levemente dobrados.' },
    'flexao': { passos: ['Mãos um pouco mais abertas que os ombros, corpo reto.', 'Desça até o peito quase tocar o chão.', 'Empurre o chão até estender os braços.'], erro: 'Deixar o quadril cair.' },
    'triceps-corda': { passos: ['Polia no alto, cotovelos colados ao corpo.', 'Estenda os braços e afaste as pontas da corda no final.', 'Volte até 90° sem mexer os cotovelos.'] },
    'triceps-corda-b': { passos: ['Polia no alto, cotovelos colados ao corpo.', 'Estenda os braços e afaste as pontas da corda no final.', 'Volte até 90° sem mexer os cotovelos.'] },
    'puxada-frontal': { passos: ['Pegada um pouco mais aberta que os ombros, coxas presas no apoio.', 'Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo.', 'Suba devagar até estender os braços.'], dica: 'Pense em puxar com os cotovelos, não com as mãos.' },
    'remada-curvada': { passos: ['Tronco inclinado a uns 45°, joelhos levemente dobrados, coluna neutra.', 'Puxe a barra em direção ao umbigo.', 'Desça controlando.'], erro: 'Arredondar a lombar.' },
    'remada-baixa': { passos: ['Sente com os joelhos levemente dobrados e o tronco ereto.', 'Puxe o triângulo até o abdômen, juntando as escápulas.', 'Estenda os braços sem curvar as costas.'] },
    'agachamento': { passos: ['Barra apoiada no trapézio, pés na largura dos ombros.', 'Desça empurrando o quadril para trás até as coxas ficarem paralelas ao chão.', 'Suba empurrando o chão com o pé inteiro.'], dica: 'Joelhos na direção das pontas dos pés.', erro: 'Tirar o calcanhar do chão.' },
    'leg-press': { passos: ['Costas e quadril bem apoiados, pés no meio da plataforma.', 'Desça até os joelhos formarem cerca de 90°.', 'Empurre sem travar os joelhos no topo.'], erro: 'Tirar o quadril do banco no fim da descida.' },
    'extensora': { passos: ['Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina.', 'Estenda as pernas até ficarem retas.', 'Desça devagar, em 2 a 3 segundos.'] },
    'stiff': { passos: ['Pés na largura do quadril, barra junto às coxas.', 'Leve o quadril para trás e desça a barra rente às pernas.', 'Suba contraindo glúteos e posterior.'], dica: 'Joelhos levemente dobrados e fixos.', erro: 'Curvar a coluna para descer mais.' },
    'mesa-flexora': { passos: ['Deite com o rolo logo acima do calcanhar.', 'Flexione os joelhos trazendo o rolo em direção ao glúteo.', 'Volte devagar sem deixar a carga bater.'] },
    'panturrilha': { passos: ['Ombros sob as almofadas, ponta dos pés na plataforma.', 'Suba o máximo que conseguir na ponta dos pés.', 'Desça até alongar bem a panturrilha.'], dica: 'Segure 1 segundo no alto.' },
    'afundo': { passos: ['Um halter em cada mão, dê um passo largo à frente.', 'Desça até o joelho de trás quase tocar o chão.', 'Empurre com a perna da frente para voltar.'], dica: 'Tronco ereto e joelho da frente sobre o pé.' },
    'desenvolvimento': { passos: ['Sentado, halteres na altura das orelhas.', 'Empurre para cima até quase estender os braços.', 'Desça até a altura das orelhas.'] },
    'elevacao-lateral': { passos: ['Halteres ao lado do corpo, cotovelos levemente dobrados.', 'Eleve os braços para os lados até a altura dos ombros.', 'Desça devagar.'], erro: 'Balançar o tronco para subir o peso.' },
    'rosca-direta': { passos: ['Em pé, barra com as palmas para frente, cotovelos ao lado do corpo.', 'Flexione os cotovelos trazendo a barra ao peito.', 'Desça até estender os braços.'], erro: 'Jogar o corpo para trás.' },
    'triceps-testa': { passos: ['Deitado, barra W acima do peito com os braços estendidos.', 'Dobre só os cotovelos levando a barra em direção à testa.', 'Estenda de volta.'] },
    'rosca-martelo': { passos: ['Halteres com as palmas viradas uma para a outra.', 'Flexione os cotovelos sem girar os punhos.', 'Desça devagar.'] },
    'prancha': { passos: ['Antebraços no chão, cotovelos sob os ombros.', 'Corpo reto da cabeça aos calcanhares.', 'Segure o tempo da série respirando normalmente.'], erro: 'Deixar o quadril cair ou subir demais.' },
    'abdominal-infra': { passos: ['Deitado, mãos ao lado do corpo ou segurando o banco.', 'Eleve as pernas e tire o quadril do apoio.', 'Desça devagar sem encostar os pés no chão.'] },
    'roda-abdominal': { passos: ['Ajoelhado, mãos na roda à frente dos joelhos.', 'Role para frente mantendo o abdômen contraído.', 'Volte puxando com o abdômen.'], erro: 'Deixar a lombar afundar.' }
  }
};
