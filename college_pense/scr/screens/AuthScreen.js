import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView, // Importar SafeAreaView
} from 'react-native';
import { supabase } from '../screens/supabase'; 

// Ajuste o caminho do logo conforme a localização real
const logoPath = require('../assets/logo_pense.png'); 

const { height, width } = Dimensions.get('window');

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      Alert.alert('Erro ao entrar', 'Verifique seu e-mail e senha.');
      console.error('Detalhe do erro de login:', error.message);
    } else {
      Alert.alert('Sucesso', 'Login realizado!');
      // A navegação real é gerenciada pelo AuthStateChange no App.js
    }
  }

  return (
    // SafeAreaView para garantir que o conteúdo não seja cortado por entalhes (notches)
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -height * 0.15} // Ajuste fino para Android
      >
        {/* Seção Superior com a Logo */}
        <View style={styles.topSection}>
          <Image
            source={logoPath}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Cartão de Login */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Acesse a sua conta</Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const PRIMARY_COLOR = '#9386ff'; // Roxo Suave
const SECONDARY_COLOR = '#27386d'; // Azul Marinho
const TEXT_COLOR = '#4A5568'; 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, // Fundo roxo em toda a safe area
  },
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, // O roxo fica no fundo, preenchido
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    justifyContent: 'space-between', // Espaça a seção superior e o cartão
  },
  topSection: {
    flex: 0.45, // Ocupa a parte superior para o logo
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: '70%', // A logo ocupa 70% da largura disponível na seção superior
    height: 80, // Altura maior para a logo
    resizeMode: 'contain',
    marginTop: 20, // Ajuste para descer um pouco, se necessário
  },
  card: {
    backgroundColor: '#FFFFFF', // Cartão de login branco
    width: '100%', // Ocupa toda a largura
    padding: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    paddingTop: 40, // Espaço maior no topo do cartão
    flex: 0.60, // Ocupa a parte inferior para o formulário
    // Sombra elegante
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 }, // Sombra vindo de cima
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: SECONDARY_COLOR,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 30,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    backgroundColor: SECONDARY_COLOR,
    padding: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: SECONDARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});