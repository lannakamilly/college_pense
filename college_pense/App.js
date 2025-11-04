// App.js
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
    StyleSheet, 
    Text, 
    View, 
    ActivityIndicator, 
    Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { 
    createDrawerNavigator, 
    DrawerContentScrollView, 
    DrawerItemList, 
    DrawerItem,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// ==========================================================
// 1. IMPORTS REAIS DAS TELAS E SUPABASE
// ==========================================================
import { supabase } from './scr/screens/supabase';
import AuthScreen from './scr/screens/AuthScreen';
import ProfessorMainScreen from './scr/screens/ProfessorMainScreen';
import TurmaCadastroScreen from './scr/screens/TurmaCadastroScreen';
import TurmaAtividadesScreen from './scr/screens/TurmaAtividadesScreen';
import AtividadeFormScreen from './scr/screens/AtividadeFormScreen';

// --- CORES e CONSTANTES GLOBAIS ---
const BRAND_PRIMARY = '#9386ff';    // Roxo Suave (Fundo do Drawer)
const BRAND_SECONDARY = '#27386d';  // Azul Marinho (Cor de destaque/ativo)
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#EF4444';    // Vermelho para Sair
const LOGO_PATH = require('./scr/assets/logo_pense.png'); // Caminho da sua logo

// --- Função de Logout Global (Garantindo a funcionalidade) ---
const globalHandleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error.message);
  }
};


// ==========================================================
// 2. CONFIGURAÇÃO DOS NAVEGADORES
// ==========================================================
const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

// --- Componente Customizado do Drawer (Fundo Roxo, Ícones Brancos) ---
function CustomDrawerContent(props) {
  return (
    <SafeAreaView style={customDrawerStyles.drawerContainer}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Cabeçalho Customizado com o Logo */}
        <View style={customDrawerStyles.header}>
          <Image
            source={LOGO_PATH}
            style={customDrawerStyles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Itens de Navegação Padrão */}
        <DrawerItemList {...props} />

        {/* Item de Sair (Logout) */}
        <View style={customDrawerStyles.separator} />
        <DrawerItem
          label="Sair"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color={DANGER_COLOR} size={size} />
          )}
          onPress={globalHandleLogout}
          labelStyle={customDrawerStyles.logoutLabel}
          // Usamos o estilo no item para garantir o fundo roxo
          style={customDrawerStyles.logoutItem} 
        />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}


// --- Navegador do Professor (Drawer) ---
function ProfessorDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="ProfessorMain"
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Usando conteúdo customizado
      
      screenOptions={({ navigation }) => ({
        // Estilos para os itens e navegação
        drawerActiveTintColor: BRAND_SECONDARY, // Texto e ícone ativo Azul Marinho
        drawerActiveBackgroundColor: WHITE, // Fundo ativo Branco para contraste
        drawerInactiveTintColor: WHITE, // Texto e ícone inativo Branco
        drawerLabelStyle: { marginLeft: -16, fontWeight: '700', fontSize: 16 },
        drawerItemStyle: { 
            borderRadius: 10, 
            marginHorizontal: 15, 
            marginVertical: 6, // Mais espaço vertical
            backgroundColor: 'transparent' // Garante que o item não tenha fundo indesejado
        }, 
        
        // Estilo da barra superior (Header)
        headerStyle: { backgroundColor: BRAND_SECONDARY },
        headerTintColor: WHITE,
        
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={28}
            color={WHITE}
            style={styles.headerRightIcon}
            onPress={globalHandleLogout}
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
  // ... (código inalterado)
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
        <ActivityIndicator size="large" color={BRAND_PRIMARY} />
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
    backgroundColor: WHITE, 
  },
  headerRightIcon:{
    marginRight: 15,
  }
});

const customDrawerStyles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: BRAND_PRIMARY, // Fundo do Drawer Roxo Suave
  },
  header: {
    paddingVertical: 30, // Mais espaço vertical para o logo
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Mantém o fundo roxo
    marginBottom: 10,
    // Removendo bordas e sombras para um visual flat no fundo roxo
  },
  logo: {
    width: '100%',
    height: 60,
  },
  separator: {
    height: 1,
    backgroundColor: WHITE, // Separador branco
    marginVertical: 15,
    marginHorizontal: 15,
    opacity: 0.5, // Levemente transparente
  },
  logoutLabel: {
    fontWeight: '700',
    marginLeft: -16,
    fontSize: 16,
    color: DANGER_COLOR, // Cor de perigo deve se manter
  },
  logoutItem: {
    borderRadius: 10, 
    marginHorizontal: 15, 
    marginVertical: 6,
    backgroundColor: WHITE, // Fundo branco para o botão Sair
  }
});