// App.js
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// ==========================================================
// 1. IMPORTS REAIS DAS TELAS E SUPABASE
// ==========================================================

// Caminhos ajustados (sua pasta se chama "scr")
import { supabase } from './scr/screens/supabase';
import AuthScreen from './scr/screens/AuthScreen';
import ProfessorMainScreen from './scr/screens/ProfessorMainScreen';
import TurmaCadastroScreen from './scr/screens/TurmaCadastroScreen';
import TurmaAtividadesScreen from './scr/screens/TurmaAtividadesScreen';
import AtividadeFormScreen from './scr/screens/AtividadeFormScreen';

// ==========================================================
// 2. CONFIGURAÇÃO DOS NAVEGADORES
// ==========================================================
const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

// --- Navegador do Professor (Drawer) ---
function ProfessorDrawerNavigator() {
  const handleLogout = async (navigation) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    }
  };

  return (
    <Drawer.Navigator
      initialRouteName="ProfessorMain"
      screenOptions={({ navigation }) => ({
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { marginLeft: -16, fontWeight: '600' },
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff',
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={28}
            color="white"
            style={{ marginRight: 15 }}
            onPress={() => handleLogout(navigation)}
          />
        ),
      })}
    >
      <Drawer.Screen
        name="ProfessorMain"
        component={ProfessorMainScreen}
        options={{
          title: 'Minhas Turmas',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="TurmaCadastro"
        component={TurmaCadastroScreen}
        options={{
          title: 'Cadastrar Turma',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// --- Stack Navigator Interno do Professor ---
function ProfessorFlow() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="ProfessorHomeDrawer"
        component={ProfessorDrawerNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="TurmaAtividades"
        component={TurmaAtividadesScreen}
        options={{ title: 'Atividades da Turma' }}
      />
      <RootStack.Screen
        name="AtividadeForm"
        component={AtividadeFormScreen}
        options={{ title: 'Cadastro de Atividade' }}
      />
    </RootStack.Navigator>
  );
}

// ==========================================================
// 3. COMPONENTE PRINCIPAL APP
// ==========================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega sessão do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tela de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <RootStack.Screen name="ProfessorContent" component={ProfessorFlow} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthScreen} />
        )}
      </RootStack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

// ==========================================================
// 4. ESTILOS
// ==========================================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
