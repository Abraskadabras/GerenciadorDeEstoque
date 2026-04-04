import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
export default function DetalheEstoque() {
  const { id } = useLocalSearchParams();
  return <View><Text>Detalhe do item: {id}</Text></View>;
}