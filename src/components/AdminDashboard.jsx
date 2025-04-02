import React, { useState, useRef } from 'react';
import { participants as participantsService } from '../supabase';

function AdminDashboard({ participants: participantsList, onAddParticipant, onUpdateParticipant, onDeleteParticipant, onLogout, activeTab, setActiveTab }) {
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    tag: '',
    points: '',
    image_url: null,
    spreadsheet_id: ''
  });
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [deletingParticipant, setDeletingParticipant] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [pointsType, setPointsType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSavingMonth, setIsSavingMonth] = useState(false);
  const fileInputRef = useRef(null);
  const newFileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewParticipant({ ...newParticipant, image_url: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAddParticipant({ ...newParticipant });
      setNewParticipant({
        name: '',
        tag: '',
        points: '',
        image_url: null,
        spreadsheet_id: '',
      });
      setPreviewImage(null);
    } catch (error) {
      console.error('Erro ao adicionar participante:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verificar se os pontos foram alterados
      const originalParticipant = participantsList.find(p => p.id === editingParticipant.id);
      const oldPoints = originalParticipant ? parseInt(originalParticipant.points) || 0 : 0;
      const newPoints = parseInt(editingParticipant.points) || 0;
      
      // Se houve mudança nos pontos, registrar no histórico
      if (oldPoints !== newPoints) {
        const pointsDiff = newPoints - oldPoints;
        const historyEntry = {
          id: Date.now().toString(),
          participantId: editingParticipant.id,
          type: 'MANUAL',
          quantity: 1,
          points: Math.abs(pointsDiff),
          action: pointsDiff > 0 ? 'add' : 'remove',
          timestamp: new Date().toISOString(),
          prevPoints: oldPoints,
          newPoints: newPoints
        };
        
        // Salvar histórico no localStorage
        const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
        const updatedHistory = [historyEntry, ...history];
        localStorage.setItem('pointsHistory', JSON.stringify(updatedHistory));
      }
      
      // Converter pontos para número antes de enviar
      const updatedData = {
        ...editingParticipant,
        points: newPoints
      };
      await onUpdateParticipant(updatedData);
      setEditingParticipant(null);
      setPointsHistory([]);
    } catch (error) {
      console.error('Erro ao atualizar participante:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingParticipant) return;
    
    setIsSubmitting(true);
    try {
      await onDeleteParticipant(deletingParticipant.id);
      setDeletingParticipant(null);
    } catch (error) {
      console.error('Erro ao deletar participante:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await participantsService.syncPointsFromSheet();
      alert('Pontos sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar pontos:', error);
      alert('Erro ao sincronizar pontos. Verifique o console para mais detalhes.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditClick = (participant) => {
    setEditingParticipant({ ...participant });
    
    // Carregar histórico de pontos para este participante
    const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
    const participantHistory = history.filter(entry => entry.participantId === participant.id);
    setPointsHistory(participantHistory);
  };

  const handleCancelEdit = () => {
    setEditingParticipant(null);
    setPointsHistory([]);
  };

  const handleSaveEdit = () => {
    handleUpdate({ preventDefault: () => {} });
  };

  const handleInputChange = (e, isForNewParticipant = false) => {
    const { name, value } = e.target;
    
    if (isForNewParticipant) {
      setNewParticipant(prev => ({ ...prev, [name]: name === 'points' ? Number(value) : value }));
    } else {
      setEditingParticipant(prev => ({ ...prev, [name]: name === 'points' ? Number(value) : value }));
    }
  };

  const handleAddParticipantClick = () => {
    setIsAddingParticipant(true);
  };

  const handleCancelAdd = () => {
    setIsAddingParticipant(false);
    setNewParticipant({
      name: '',
      tag: '',
      points: '',
      image_url: null,
      spreadsheet_id: '',
    });
  };

  const handleSaveNewParticipant = () => {
    onAddParticipant({ ...newParticipant });
    setIsAddingParticipant(false);
    setNewParticipant({
      name: '',
      tag: '',
      points: '',
      image_url: null,
      spreadsheet_id: '',
    });
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este participante?')) {
      onDeleteParticipant(id);
    }
  };

  // Função para lidar com o upload de imagem
  const handleImageUpload = (e) => {
    e.preventDefault(); // Previne o envio do formulário
    const file = e.target.files[0];
    if (!file) return;

    // Verificar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    // Verificar o tipo do arquivo
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Converter a imagem para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      setEditingParticipant(prev => ({ ...prev, image_url: base64Image }));
    };
    reader.readAsDataURL(file);
  };

  // Função para lidar com o upload de imagem para novo participante
  const handleNewParticipantImageUpload = (e) => {
    e.preventDefault(); // Previne o envio do formulário
    const file = e.target.files[0];
    if (!file) return;

    // Verificar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    // Verificar o tipo do arquivo
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Converter a imagem para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      setNewParticipant(prev => ({ ...prev, image_url: base64Image }));
    };
    reader.readAsDataURL(file);
  };

  // Função para adicionar pontos ao participante selecionado
  const handleAddPoints = async () => {
    if (!selectedParticipant || !pointsType) return;
    
    setIsSubmitting(true);
    try {
      const pointsPerItem = pointsType === 'REELS' || pointsType === 'CRIATIVO' ? 2 : 0;
      const pointsToAdd = pointsPerItem * quantity;
      
      if (pointsToAdd > 0) {
        // Criar entrada no histórico de pontos
        const historyEntry = {
          id: Date.now().toString(),
          participantId: selectedParticipant.id,
          type: pointsType,
          quantity: quantity,
          points: pointsToAdd,
          action: 'add',
          timestamp: new Date().toISOString(),
          prevPoints: parseInt(selectedParticipant.points),
          newPoints: parseInt(selectedParticipant.points) + pointsToAdd
        };
        
        // Salvar histórico no localStorage
        const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
        const updatedHistory = [historyEntry, ...history];
        localStorage.setItem('pointsHistory', JSON.stringify(updatedHistory));
        
        const updatedParticipant = {
          ...selectedParticipant,
          points: parseInt(selectedParticipant.points) + pointsToAdd
        };
        
        await onUpdateParticipant(updatedParticipant);
        alert(`Adicionado ${pointsToAdd} pontos (${quantity} ${pointsType}) para ${selectedParticipant.name}.`);
        setIsAddingPoints(false);
        setSelectedParticipant(null);
        setPointsType('');
        setQuantity(1);
      }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error.message);
      alert('Erro ao adicionar pontos. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddPoints = () => {
    console.log('Participantes disponíveis:', participantsList);
    setIsAddingPoints(true);
  };

  const handleCancelAddPoints = () => {
    setIsAddingPoints(false);
    setSelectedParticipant(null);
    setPointsType('');
    setQuantity(1);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleShowHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await participantsService.getMonthlyHistory();
      setMonthlyHistory(history);
      setIsShowingHistory(true);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      alert('Erro ao carregar histórico mensal.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSaveMonth = async () => {
    if (!window.confirm('Isso irá salvar os pontos atuais e ZERAR os pontos de todos os participantes. Deseja continuar?')) {
      return;
    }

    setIsSavingMonth(true);
    try {
      await participantsService.saveMonthlyPoints();
      alert('Pontos do mês salvos com sucesso!');
      // Recarregar a lista de participantes
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar pontos do mês:', error);
      alert('Erro ao salvar pontos do mês.');
    } finally {
      setIsSavingMonth(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    setActiveTab('classification');
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-red-500">Painel de Administração</h2>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="bg-black/70 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-400">Participantes</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:bg-yellow-700 disabled:opacity-70"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Pontos'}
              </button>
              <button 
                onClick={handleSaveMonth}
                disabled={isSavingMonth}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:bg-purple-700 disabled:opacity-70"
              >
                {isSavingMonth ? 'Salvando...' : 'Salvar Mês'}
              </button>
              <button 
                onClick={handleShowHistory}
                disabled={isLoadingHistory}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:bg-cyan-700 disabled:opacity-70"
              >
                {isLoadingHistory ? 'Carregando...' : 'Ver Histórico'}
              </button>
              <button 
                onClick={handleOpenAddPoints}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Adicionar Pontos
              </button>
              <button 
                onClick={handleAddParticipantClick}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Adicionar Participante
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pontos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Planilha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {participantsList.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        {participant.image_url ? (
                          <img 
                            src={participant.image_url} 
                            alt={participant.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-red-500 font-bold">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{participant.name}</div>
                      <div className="text-sm text-gray-400">{participant.tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{participant.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{participant.spreadsheet_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(participant)}
                        className="text-red-400 hover:text-red-300 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingParticipant(participant)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de edição - Centralizado na tela */}
        {editingParticipant && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-6 max-w-md w-full border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Participante
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={editingParticipant.name} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tag
                  </label>
                  <input 
                    type="text" 
                    name="tag" 
                    value={editingParticipant.tag} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Pontos
                  </label>
                  <input 
                    type="number" 
                    name="points" 
                    value={editingParticipant.points} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ID da Planilha
                  </label>
                  <input 
                    type="text" 
                    name="spreadsheet_id" 
                    value={editingParticipant.spreadsheet_id || ''} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Na URL da planilha: https://docs.google.com/spreadsheets/d/<span className="text-red-400">ID_DA_PLANILHA</span>/edit
                    <br />
                    Cole apenas a parte destacada em vermelho da URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Imagem
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      name="image_url" 
                      value={editingParticipant.image_url || ''} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                      placeholder="URL da imagem ou use o botão ao lado"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {editingParticipant.image_url && (
                    <div className="mt-2 flex items-center">
                      <img 
                        src={editingParticipant.image_url} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover rounded-full border-2 border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingParticipant(prev => ({ ...prev, image_url: '' }))}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para adicionar novo participante */}
        {isAddingParticipant && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-6 max-w-md w-full border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Participante
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newParticipant.name} 
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tag
                  </label>
                  <input 
                    type="text" 
                    name="tag" 
                    value={newParticipant.tag} 
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Pontos
                  </label>
                  <input 
                    type="number" 
                    name="points" 
                    value={newParticipant.points} 
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ID da Planilha
                  </label>
                  <input 
                    type="text" 
                    name="spreadsheet_id" 
                    value={newParticipant.spreadsheet_id || ''} 
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Na URL da planilha: https://docs.google.com/spreadsheets/d/<span className="text-red-400">ID_DA_PLANILHA</span>/edit
                    <br />
                    Cole apenas a parte destacada em vermelho da URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Imagem
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      name="image_url" 
                      value={newParticipant.image_url || ''} 
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                      placeholder="URL da imagem ou use o botão ao lado"
                    />
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current.click()}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Upload
                    </button>
                    <input
                      ref={newFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewParticipantImageUpload}
                      className="hidden"
                    />
                  </div>
                  {newParticipant.image_url && (
                    <div className="mt-2 flex items-center">
                      <img 
                        src={newParticipant.image_url} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover rounded-full border-2 border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setNewParticipant(prev => ({ ...prev, image_url: '' }))}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={handleCancelAdd}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNewParticipant}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para adicionar pontos a um participante */}
        {isAddingPoints && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-6 max-w-md w-full border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Pontos
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Participante
                  </label>
                  {participantsList.length > 0 ? (
                    <select
                      value={selectedParticipant ? selectedParticipant.id : ''}
                      onChange={(e) => {
                        const participant = participantsList.find(p => p.id.toString() === e.target.value);
                        setSelectedParticipant(participant || null);
                      }}
                      className="w-full px-3 py-2 bg-black/50 text-white rounded border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                    >
                      <option value="">Selecione um participante</option>
                      {participantsList.map(participant => (
                        <option key={participant.id} value={participant.id.toString()}>
                          {participant.name} ({participant.points} pontos)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 bg-black/70 text-red-400 rounded border border-red-500/30">
                      Nenhum participante disponível
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo de Pontos
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="reels"
                        name="pointsType"
                        value="REELS"
                        checked={pointsType === 'REELS'}
                        onChange={() => setPointsType('REELS')}
                        className="text-red-500 focus:ring-red-500 h-4 w-4"
                      />
                      <label htmlFor="reels" className="text-white">
                        REELS (2 pontos)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="criativo"
                        name="pointsType"
                        value="CRIATIVO"
                        checked={pointsType === 'CRIATIVO'}
                        onChange={() => setPointsType('CRIATIVO')}
                        className="text-red-500 focus:ring-red-500 h-4 w-4"
                      />
                      <label htmlFor="criativo" className="text-white">
                        CRIATIVO (2 pontos)
                      </label>
                    </div>
                  </div>
                </div>
                
                {pointsType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Quantidade
                    </label>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1 bg-red-600 text-white rounded-l hover:bg-red-700 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center py-1 bg-black/50 text-white border-y border-red-500/30 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="px-3 py-1 bg-red-600 text-white rounded-r hover:bg-red-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {selectedParticipant && pointsType && (
                  <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-400 font-medium">Resumo:</p>
                    <p className="text-white">
                      Adicionar <span className="font-bold">{2 * quantity} pontos</span> ({quantity} {pointsType} x 2) para <span className="font-bold">{selectedParticipant.name}</span>.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Pontos atuais: {selectedParticipant.points} → Novos pontos: {parseInt(selectedParticipant.points) + (2 * quantity)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Histórico de pontos */}
              <div className="mt-4 border-t border-red-500/30 pt-4">
                <h4 className="text-lg font-medium text-red-400 mb-2">Histórico de Pontos</h4>
                {pointsHistory.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto bg-black/30 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-black/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Data</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Tipo</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Pontos</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {pointsHistory.map(entry => (
                          <tr key={entry.id} className={entry.action === 'add' ? 'bg-green-900/20' : 'bg-red-900/20'}>
                            <td className="px-3 py-2 text-xs text-gray-300">
                              {formatDate(entry.timestamp)}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-300">
                              {entry.type} {entry.quantity > 1 ? `(${entry.quantity}x)` : ''}
                            </td>
                            <td className={`px-3 py-2 text-xs font-medium ${entry.action === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                              {entry.action === 'add' ? '+' : '-'}{entry.points}
                            </td>
                            <td className="px-3 py-2 text-xs text-white">
                              {entry.newPoints}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum registro de pontos encontrado.</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={handleCancelAddPoints}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddPoints}
                  disabled={!selectedParticipant || !pointsType || isSubmitting}
                  className={`px-4 py-2 ${
                    !selectedParticipant || !pointsType || isSubmitting
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                  } text-white rounded transition-all duration-300 shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]`}
                >
                  {isSubmitting ? 'Processando...' : 'Adicionar Pontos'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Histórico Mensal */}
        {isShowingHistory && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-6 max-w-4xl w-full border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-red-500">Histórico Mensal de Pontos</h3>
                <button
                  onClick={() => setIsShowingHistory(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mês/Ano</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Participante</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pontos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {monthlyHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2021, record.month - 1))}/{record.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700 mr-3">
                              {record.participants.image_url ? (
                                <img 
                                  src={record.participants.image_url} 
                                  alt={record.participants.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-800 text-red-500">
                                  {record.participants.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{record.participants.name}</div>
                              <div className="text-sm text-gray-400">{record.participants.tag}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{record.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(record.created_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 