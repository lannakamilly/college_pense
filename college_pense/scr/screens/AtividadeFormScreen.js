import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Oi, mundo!</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeaf3', // fundo rosa claro
  },
  texto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4da6', // rosa mais forte
  },
});
