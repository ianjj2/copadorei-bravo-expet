// Configuração do Sheety
const SHEETY_API_URL = 'https://api.sheety.co/seu-id-aqui/sua-planilha/conteudos';

// Função para extrair o ID da planilha
const extractSheetInfo = (input) => {
  if (!input) return { sheetId: null, sheetName: 'Conteúdos' };
  
  console.log('Input original:', input);
  
  let sheetId = null;
  let sheetName = 'Conteúdos';
  
  // Se for uma URL, extrai o ID
  if (input.includes('spreadsheets/d/')) {
    const matches = input.match(/spreadsheets\/d\/([^\/]+)/);
    if (matches && matches[1]) {
      sheetId = matches[1];
    }
  } else {
    sheetId = input;
  }

  return { sheetId, sheetName };
};

// Função para buscar dados de uma planilha específica
export const fetchPointsFromSingleSheet = async (spreadsheetId) => {
  try {
    console.log('Recebido spreadsheetId:', spreadsheetId);
    
    // Extrai o ID correto da planilha
    const { sheetId } = extractSheetInfo(spreadsheetId);
    if (!sheetId) {
      console.error('ID da planilha inválido:', spreadsheetId);
      return 0;
    }

    console.log('Buscando dados da planilha:', sheetId);

    // Aqui você vai substituir com sua URL do Sheety após criar o projeto
    const url = `${SHEETY_API_URL}seu-id-do-projeto/conteudos`;
    console.log('Tentando URL:', url);

    let response = await fetch(url);

    if (!response.ok) {
      console.error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
      return 0;
    }

    const data = await response.json();
    
    if (!data || !data.conteudos) {
      console.log('Nenhum dado encontrado na planilha');
      return 0;
    }

    // Soma todos os pontos encontrados
    const totalPoints = data.conteudos.reduce((sum, row) => {
      const points = parseInt(row.pontos) || 0;
      return sum + points;
    }, 0);

    console.log(`Total de pontos encontrados:`, totalPoints);
    return totalPoints;
  } catch (error) {
    console.error(`Erro ao buscar dados da planilha:`, error);
    return 0;
  }
};

// Função principal para buscar dados de todas as planilhas
export const fetchPointsFromSheet = async (participants) => {
  try {
    const participantsData = await Promise.all(
      participants.map(async (participant) => {
        if (!participant.spreadsheet_id) {
          return {
            ...participant,
            points: 0
          };
        }
        const points = await fetchPointsFromSingleSheet(participant.spreadsheet_id);
        return {
          ...participant,
          points
        };
      })
    );

    return participantsData;
  } catch (error) {
    console.error('Erro ao buscar dados das planilhas:', error);
    throw error;
  }
}; 