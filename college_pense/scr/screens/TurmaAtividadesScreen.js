import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
    ActivityIndicator, Modal, TextInput, ScrollView 
} from 'react-native';
import { supabase } from '../screens/supabase'; 
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#9386ff'; 
const DANGER_COLOR = '#27386d'; 
const ACCENT_COLOR = '#9386ff'; 
const LIGHT_GREY = '#F0F0F0';
const DISABLED_COLOR = '#A5D6A7'; 

const TAB_BAR_HEIGHT_MARGIN = 60; 

// =======================================================
// Componente Modal de Formulário de Atividade
// =======================================================
const AtividadeFormModal = ({ visible, onClose, turmaId, selectedAtividade, onSaveSuccess }) => {
    // CORREÇÃO: Usamos apenas 'descricao' (texto principal)
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    const isEditing = !!selectedAtividade;

    useEffect(() => {
        if (visible) {
            // CORREÇÃO: Mapeia para a coluna 'descricao' do banco
            setDescricao(isEditing ? selectedAtividade.descricao : '');
        }
    }, [visible, selectedAtividade]);

    const handleSave = async () => {
        if (!descricao.trim()) {
            Alert.alert('Atenção', 'A descrição da atividade é obrigatória.');
            return;
        }

        setLoading(true);

        // CORREÇÃO: O objeto de dados tem apenas a coluna 'descricao'
        const atividadeData = {
            descricao: descricao.trim(),
        };
        
        let error = null;

        if (isEditing) {
            // MODO EDIÇÃO
            const result = await supabase
                .from('atividades')
                .update(atividadeData)
                .eq('id', selectedAtividade.id);
            error = result.error;
        } else {
            // MODO CADASTRO
            atividadeData.turma_id = turmaId; // Chave estrangeira para ligar à turma
            
            const result = await supabase
                .from('atividades')
                .insert([atividadeData]);
            error = result.error;
        }

        setLoading(false);

        if (error) {
            console.error('Erro ao salvar atividade:', error);
            Alert.alert('Erro', `Não foi possível salvar a atividade: ${error.message}`);
        } else {
            Alert.alert('Sucesso', `Atividade ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
            onSaveSuccess(); // Recarrega a lista
            onClose();      // Fecha o modal
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>{isEditing ? 'Editar Atividade' : 'Nova Atividade'}</Text>

                    <ScrollView style={modalStyles.formContainer}>
                        {/* CORREÇÃO: Usamos o campo de texto único, que é a 'Descricao' */}
                        <Text style={modalStyles.label}>Descrição Completa *</Text>
                        <TextInput
                            style={[modalStyles.input, modalStyles.textArea]}
                            placeholder="Descreva a atividade, conteúdo ou tarefa aqui..."
                            onChangeText={setDescricao}
                            value={descricao}
                            multiline={true}
                            numberOfLines={6}
                            maxLength={1000}
                        />
                    </ScrollView>

                    <View style={modalStyles.buttonGroup}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonClose]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={modalStyles.textStyle}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonSave, loading && modalStyles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={modalStyles.textStyle}>{isEditing ? 'Salvar Edição' : 'Cadastrar'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// =======================================================
// TurmaAtividadesScreen Principal
// =======================================================
export default function TurmaAtividadesScreen({ navigation, route }) {
    const { turmaId, turmaNome } = route.params;

    const [atividades, setAtividades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAtividade, setSelectedAtividade] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            title: `Atividades de: ${turmaNome}`,
        });
    }, [navigation, turmaNome]);

    const fetchAtividades = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('atividades')
            // CORREÇÃO: Selecionando apenas as colunas que existem no DB
            .select('id, descricao, created_at, turma_id') 
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false });
        
        setLoading(false);

        if (error) {
            console.error('Erro ao buscar atividades:', error);
            Alert.alert('Erro', 'Não foi possível carregar as atividades.');
        } else {
            setAtividades(data);
        }
    }, [turmaId]);

    useFocusEffect(
        useCallback(() => {
            fetchAtividades();
            return () => {};
        }, [fetchAtividades])
    );
    
    const handleOpenModal = (atividade = null) => {
        setSelectedAtividade(atividade);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedAtividade(null);
    };


    const handleDeleteAtividade = (atividadeId) => {
        // Usamos o id como título na confirmação, pois não há título
        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir a atividade ID ${atividadeId}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: () => deleteAtividade(atividadeId) }
            ],
            { cancelable: true }
        );
    };

    const deleteAtividade = async (atividadeId) => {
        setLoading(true);
        const { error } = await supabase
            .from('atividades')
            .delete()
            .eq('id', atividadeId);
        setLoading(false);

        if (error) {
            Alert.alert('Erro', 'Não foi possível excluir a atividade.');
        } else {
            Alert.alert('Sucesso', 'Atividade excluída com sucesso!');
            setAtividades(prevAtividades => prevAtividades.filter(ativ => ativ.id !== atividadeId));
        }
    };


    const renderItem = ({ item }) => (
        <View style={styles.atividadeCard}>
            <View style={styles.atividadeInfo}>
                {/* CORREÇÃO: Usamos o ID como Título e a Descrição para o conteúdo */}
                <Text style={styles.atividadeTitulo}>ID Atividade: {item.id}</Text>
                <Text style={styles.atividadeDetalhe}>{item.descricao?.substring(0, 80) + '...' || 'Sem descrição.'}</Text>
                <Text style={styles.atividadeDetalheData}>Criada em: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.actionsContainer}>
                {/* Botão de Edição (Abre o modal no modo edição) */}
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleOpenModal(item)}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Botão de Exclusão */}
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAtividade(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Carregando atividades...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AtividadeFormModal
                visible={modalVisible}
                onClose={handleCloseModal}
                turmaId={turmaId}
                selectedAtividade={selectedAtividade}
                onSaveSuccess={fetchAtividades}
            />

            <FlatList
                data={atividades}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade cadastrada para esta turma. Toque no '+' para criar!</Text>}
                contentContainerStyle={[
                    atividades.length === 0 && styles.listEmpty, 
                    { paddingBottom: TAB_BAR_HEIGHT_MARGIN } 
                ]}
            />

            {/* Botão Flutuante (FAB) para Adicionar Nova Atividade (Abre o modal no modo cadastro) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => handleOpenModal()} 
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

// =======================================================
// Estilos da Tela Principal
// =======================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_GREY,
        padding: 10,
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
    atividadeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: ACCENT_COLOR, // Destaque visual
    },
    atividadeInfo: {
        flex: 1,
        paddingRight: 10,
    },
    atividadeTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    atividadeDetalhe: {
        fontSize: 14,
        color: '#666',
    },
    atividadeDetalheData: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteButton: {
        backgroundColor: DANGER_COLOR,
        padding: 8,
        borderRadius: 5,
        marginLeft: 10,
    },
    editButton: {
        backgroundColor: PRIMARY_COLOR,
        padding: 8,
        borderRadius: 5,
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
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 50,
    },
    listEmpty: {
        flexGrow: 1, 
        justifyContent: 'center' 
    }
});

// =======================================================
// Estilos do Modal de Formulário
// =======================================================
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: PRIMARY_COLOR,
    },
    formContainer: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 5,
        color: '#444',
    },
    input: {
        height: 45,
        backgroundColor: LIGHT_GREY,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 150, // Aumentei a altura para a descrição ser o campo principal
        paddingTop: 10,
        textAlignVertical: 'top',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: '#999',
    },
    buttonSave: {
        backgroundColor: PRIMARY_COLOR,
    },
    buttonDisabled: {
        backgroundColor: DISABLED_COLOR,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});