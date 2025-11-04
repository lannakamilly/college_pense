// src/config/supabase.js

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa o AsyncStorage

// 1. Substitua pelas suas chaves
const supabaseUrl = 'https://jitbbfhfvhabfrwmwoaa.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdGJiZmhmdmhhYmZyd213b2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzU3NjMsImV4cCI6MjA3NzgxMTc2M30.pINdIJB64ORjziR43avNZJmi8zx6RofwTfD0XhREwpA'; 

// 2. Inicializa o cliente Supabase com AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configura o AsyncStorage para persistir a sessão de login
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});