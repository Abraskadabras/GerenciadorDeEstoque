import { Tabs } from 'expo-router';

export default function Layout() {
  return (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />;
    <Tabs.Screen name="estoque" options={{ title: 'Estoque' }} />
    <Tabs.Screen name="fornecedores" options={{ title: 'Fornecedores' }} />
    <Tabs.Screen name="materiais" options={{ title: 'Materiais' }} />

    <Tabs.Screen name="estoque/novo" options={{ href: null }} />
    <Tabs.Screen name="estoque/[id]" options={{ href: null }} />
    <Tabs.Screen name="fornecedores/novo" options={{ href: null }} />
    <Tabs.Screen name="materiais/novo" options={{ href: null }} />
    

  </Tabs>
  ); 
}