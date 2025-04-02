import { createClient } from '@supabase/supabase-js';
import { fetchPointsFromSheet } from './services/googleSheets';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache e Rate Limiting
const cache = {
  participants: null,
  lastFetchTime: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  requestCount: 0,
  lastRequestTime: Date.now(),
  MAX_REQUESTS_PER_MINUTE: 60
};

const checkRateLimit = () => {
  const now = Date.now();
  if (now - cache.lastRequestTime > 60000) {
    cache.requestCount = 0;
    cache.lastRequestTime = now;
  }
  
  if (cache.requestCount >= cache.MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  cache.requestCount++;
};

// Autenticação
export const auth = {
  signIn: async (email, password) => {
    checkRateLimit();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    checkRateLimit();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentUser: async () => {
    checkRateLimit();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user;
  }
};

// Gerenciamento de participantes
export const participants = {
  getAll: async (page = 1, limit = 20) => {
    checkRateLimit();
    
    // Verifica se há cache válido
    if (cache.participants && cache.lastFetchTime && 
        (Date.now() - cache.lastFetchTime < cache.CACHE_DURATION)) {
      return cache.participants;
    }

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('points', { ascending: false });
    
    if (error) throw error;
    
    // Atualiza o cache
    const participantsWithPosition = data.map((participant, index) => ({
      ...participant,
      position: index + 1,
      image: participant.image_url
    }));

    cache.participants = participantsWithPosition;
    cache.lastFetchTime = Date.now();
    
    return participantsWithPosition;
  },
  
  getById: async (id) => {
    checkRateLimit();
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  add: async (participant) => {
    checkRateLimit();
    const { image, position, ...participantData } = participant;
    
    const { data, error } = await supabase
      .from('participants')
      .insert([participantData])
      .select();
    
    if (error) throw error;
    
    // Invalida o cache
    cache.participants = null;
    cache.lastFetchTime = null;
    
    return data[0];
  },
  
  update: async (id, updates) => {
    checkRateLimit();
    const { image, position, ...updatesWithoutExtraFields } = updates;
    
    const { data, error } = await supabase
      .from('participants')
      .update(updatesWithoutExtraFields)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // Invalida o cache
    cache.participants = null;
    cache.lastFetchTime = null;
    
    return data[0];
  },
  
  delete: async (id) => {
    checkRateLimit();
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Invalida o cache
    cache.participants = null;
    cache.lastFetchTime = null;
    
    return true;
  },
  
  subscribeToChanges: (callback) => {
    return supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants'
        },
        (payload) => {
          // Invalida o cache quando houver mudanças
          cache.participants = null;
          cache.lastFetchTime = null;
          callback(payload);
        }
      )
      .subscribe();
  },
  
  syncPointsFromSheet: async () => {
    try {
      // Busca todos os participantes
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*');

      if (error) throw error;

      // Busca pontos atualizados da planilha
      const updatedParticipants = await fetchPointsFromSheet(participants);

      // Atualiza os pontos de cada participante
      for (const participant of updatedParticipants) {
        const { error: updateError } = await supabase
          .from('participants')
          .update({ points: participant.points })
          .eq('id', participant.id);

        if (updateError) throw updateError;
      }

      // Invalida o cache
      cache.participants = null;
      cache.lastFetchTime = null;

      return true;
    } catch (error) {
      console.error('Erro ao sincronizar pontos:', error);
      throw error;
    }
  },
  
  saveMonthlyPoints: async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Buscar todos os participantes
    const { data: participants, error: fetchError } = await supabase
      .from('participants')
      .select('*');

    if (fetchError) throw fetchError;

    // Salvar pontos de cada participante
    for (const participant of participants) {
      const { error } = await supabase
        .from('monthly_points_history')
        .insert({
          participant_id: participant.id,
          month: currentMonth,
          year: currentYear,
          points: participant.points
        })
        .select()
        .single();

      if (error && error.code !== '23505') { // Ignorar erro de duplicação
        throw error;
      }
    }

    // Zerar pontos dos participantes
    const { error: resetError } = await supabase
      .from('participants')
      .update({ points: 0 })
      .neq('id', 0); // Atualizar todos os registros

    if (resetError) throw resetError;

    // Invalidar cache
    cache.participants = null;
    cache.lastFetchTime = null;
  },
  
  getMonthlyHistory: async (participantId = null) => {
    let query = supabase
      .from('monthly_points_history')
      .select(`
        id,
        month,
        year,
        points,
        created_at,
        participants (
          id,
          name,
          tag,
          image_url
        )
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (participantId) {
      query = query.eq('participant_id', participantId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }
};

export default supabase; 