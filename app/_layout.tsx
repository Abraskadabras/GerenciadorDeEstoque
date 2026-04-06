import { Tabs } from 'expo-router';
import { Ionicons as IoniconsType} from '@expo/vector-icons';

const Ionicons = IoniconsType as any; // Solução temporária para erro de tipo

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e5e5',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1a1a1a',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="estoque/index"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fornecedores/index"
        options={{
          title: 'Fornecedores',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="materiais/index"
        options={{
          title: 'Materiais',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contabil/index"
        options={{
          title: 'Contábil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />

      {/* Rotas ocultas */}
      <Tabs.Screen name="estoque/novo" options={{ href: null }} />
      <Tabs.Screen name="estoque/[id]" options={{ href: null }} />
      <Tabs.Screen name="fornecedores/novo" options={{ href: null }} />
      <Tabs.Screen name="fornecedores/[id]" options={{ href: null }} />
      <Tabs.Screen name="materiais/novo" options={{ href: null }} />
      <Tabs.Screen name="materiais/[id]" options={{ href: null }} />
      <Tabs.Screen name="contabil/novo" options={{ href: null }} />
    </Tabs>
  );
}