import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../screens/supabase'; 
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#9386ff'; // Verde (para Visualizar e FAB)
const DANGER_COLOR = '#27386d'; // Vermelho (para Excluir)
const INFO_COLOR = '#2196F3'; // Azul (se precisar de outro botão)
const TEXT_COLOR = '#333';
const LIGHT_GREY = '#E0E0E0'; // Para bordas e divisores

const TAB_BAR_HEIGHT_MARGIN = 60; // Margem para a navegação por abas

export default function ProfessorMainScreen({ navigation }) {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false); 

  // 1. Obtém e monitora o ID do usuário logado (professor)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
      setIsReady(true); 
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
      setIsReady(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Função para buscar as turmas
  const fetchTurmas = useCallback(async () => {
    if (!userId) {
        return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('turmas')
      .select('id, nome, professor_id') 
      .eq('professor_id', userId)
      .order('nome', { ascending: true });
    
    setLoading(false);

    if (error) {
      console.error('Erro ao buscar turmas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as turmas.');
    } else {
      setTurmas(data);
    }
  }, [userId]); 

  // 3. Recarrega as turmas toda vez que a tela está focada
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchTurmas();
      }
      return () => {};
    }, [userId, fetchTurmas])
  );

  // 4. Função para Excluir Turma (com confirmação)
  const handleDeleteTurma = (turmaId, turmaNome) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a turma "${turmaNome}"? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: () => deleteTurma(turmaId) 
        }
      ],
      { cancelable: true }
    );
  };

  const deleteTurma = async (turmaId) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', turmaId);
      
    setLoading(false);

    if (error) {
      console.error('Erro ao deletar turma:', error);
      Alert.alert('Erro', 'Não foi possível excluir a turma. Verifique as permissões de RLS.');
    } else {
      Alert.alert('Sucesso', 'Turma excluída com sucesso!');
      setTurmas(prevTurmas => prevTurmas.filter(turma => turma.id !== turmaId));
    }
  };

  // 5. Renderização de um item da lista
  const renderItem = ({ item }) => (
    <View style={styles.turmaCard}>
      <Text style={styles.turmaNome}>{item.nome}</Text>
      
      <View style={styles.actionsContainer}>
        {/* Botão de Excluir */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTurma(item.id, item.nome)}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>

        {/* Novo Botão de Visualizar */}
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('TurmaAtividades', { turmaId: item.id, turmaNome: item.nome })}
        >
          <Text style={styles.buttonText}>Visualizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading || !isReady) { 
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Minhas Turmas</Text>
      <FlatList
        data={turmas}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma turma cadastrada. Toque no '+' para criar uma nova!</Text>}
        contentContainerStyle={[
          turmas.length === 0 && styles.listEmpty, 
          { paddingBottom: TAB_BAR_HEIGHT_MARGIN } 
        ]}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TurmaCadastro')} 
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15, // Aumentei um pouco o padding geral
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  turmaCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10, // Bordas mais suaves
    padding: 15,
    marginBottom: 12, // Um pouco mais de espaço entre os cards
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8, // Sombra mais suave
    elevation: 4, // Elevação Android
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5, // Uma borda esquerda colorida para destaque
    borderLeftColor: PRIMARY_COLOR,
  },
  turmaNome: {
    flex: 1, // Permite que o nome ocupe o espaço restante
    fontSize: 17,
    fontWeight: '600', // Um pouco mais leve que bold
    color: TEXT_COLOR,
    marginRight: 10, // Espaço entre o nome e os botões
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: DANGER_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8, // Espaço entre botões
  },
  viewButton: {
    backgroundColor: PRIMARY_COLOR, // Cor verde para visualizar
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 8, // Espaço entre botões
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 25, 
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 28, // Metade da largura/altura para ser um círculo perfeito
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emptyText: {
    fontSize: 17,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
    lineHeight: 24,
  },
  listEmpty: {
    flexGrow: 1, 
    justifyContent: 'center' 
  }
});