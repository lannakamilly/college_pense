import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../screens/supabase'; // Assumindo 'scr/supabase.js'

const PRIMARY_COLOR = '#27386d'; // Verde
const DISABLED_COLOR = '#27386d53'; // Verde claro

export default function TurmaCadastroScreen({ navigation, route }) {
    // Recebe 'turma' dos parâmetros de navegação para modo edição
    const existingTurma = route.params?.turma; 
    
    const [nome, setNome] = useState(existingTurma ? existingTurma.nome : '');
    // CORREÇÃO/AJUSTE: Removemos o estado 'descricao' ou inicializamos como vazio, pois a coluna não existe no DB
    const [descricao, setDescricao] = useState(''); // Mantemos o estado apenas para o campo de input na UI, mas não será enviado.
    
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    // Define o título da tela e obtém o ID do professor
    useEffect(() => {
        navigation.setOptions({
            title: existingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma',
        });

        const checkUser = async () => {
            // Garante que o estado de autenticação seja carregado de forma assíncrona
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                Alert.alert('Erro de Autenticação', 'Você precisa estar logado para acessar esta tela.');
                // CORREÇÃO: Usar um timer para garantir que o Alert seja visto antes de voltar
                setTimeout(() => navigation.goBack(), 1000); 
            } else {
                setUserId(session.user.id);
            }
        };
        
        checkUser();
    }, [existingTurma, navigation]); // existingTurma e navigation são dependências importantes

    const validate = () => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'O nome da turma é obrigatório.');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate() || !userId) {
            if (!userId) {
                Alert.alert('Erro', 'Usuário não autenticado. Tente logar novamente.');
                // CORREÇÃO: Garante que o usuário volte ao main screen se não estiver autenticado
                setTimeout(() => navigation.navigate('ProfessorMainScreen'), 1000); 
            }
            return;
        }

        setLoading(true);
        
        // CORREÇÃO: turmasData só deve ter as colunas que existem no DB
        const turmaData = {
            nome: nome.trim(),
            // descricao FOI REMOVIDO daqui porque a coluna não existe no seu DB
        };

        let error = null;

        if (existingTurma) {
            // MODO EDIÇÃO (Faz UPDATE no Supabase)
            const result = await supabase
                .from('turmas')
                .update(turmaData) // Agora só envia 'nome'
                .eq('id', existingTurma.id)
                .select();
            error = result.error;

        } else {
            // MODO CADASTRO (Faz INSERT no Supabase)
            turmaData.professor_id = userId; // Adiciona o ID do professor OBRIGATÓRIO
            
            const result = await supabase
                .from('turmas')
                .insert([turmaData]) // Agora só envia 'nome' e 'professor_id'
                .select();
            error = result.error;
        }

        setLoading(false);

        if (error) {
            console.error('Erro ao salvar turma:', error);
            Alert.alert('Erro', `Não foi possível salvar a turma: ${error.message}`);
        } else {
            Alert.alert('Sucesso', `Turma ${existingTurma ? 'atualizada' : 'cadastrada'} com sucesso!`);
            navigation.goBack(); // Volta para a ProfessorMainScreen, que irá recarregar a lista
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Nome da Turma *</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 3º Ano A - Matutino"
                onChangeText={setNome}
                value={nome}
                maxLength={100}
            />

            {/* AVISO: Este campo não será salvo no DB 'turmas' */}
            <Text style={styles.label}>Descrição (Opcional) - Não salvo no DB</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Matemática e Português"
                onChangeText={setDescricao}
                value={descricao}
                multiline={true}
                numberOfLines={4}
                maxLength={250}
            />
            
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSave} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>{existingTurma ? 'Salvar Edições' : 'Cadastrar Turma'}</Text>
                )}
            </TouchableOpacity>
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        paddingTop: 15,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: DISABLED_COLOR,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});