import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Button, Title, Card, Paragraph } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [animais, setAnimais] = useState([]);

  // Carrega animais sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      carregarAnimais();
    }, [])
  );

  const carregarAnimais = async () => {
    try {
      const response = await fetch('https://lost-animals-backend.onrender.com/lostanimals');
      const data = await response.json();
      setAnimais(data.slice().reverse()); // mais recentes primeiro
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
    }
  };

  const excluirAnimal = async (id) => {
    Alert.alert('Excluir animal', 'Tem certeza que deseja excluir este animal?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`https://lost-animals-backend.onrender.com/lostanimals/${id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              Alert.alert('Sucesso', 'Animal excluído com sucesso!');
              carregarAnimais(); // Recarrega lista
            } else {
              Alert.alert('Erro', 'Não foi possível excluir o animal.');
            }
          } catch (error) {
            console.error('Erro ao excluir animal:', error);
            Alert.alert('Erro', 'Erro de conexão.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Image
        source={{
          uri: item.photo
            ? `https://lost-animals-backend.onrender.com${item.photo}`
            : 'https://via.placeholder.com/300x200.png?text=Sem+Imagem',
        }}
        style={styles.image}
      />
      <Card.Content>
        <Title>{item.breed}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Button
          mode="outlined"
          onPress={() => excluirAnimal(item._id)}
          style={styles.deleteButton}
        >
          Excluir
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Animais Perdidos</Title>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Cadastrar Animal')}
        style={styles.button}
      >
        Cadastrar Novo
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Mapa')}
        style={styles.button}
      >
        Ver no Mapa
      </Button>

      <FlatList
        data={animais}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  title: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  button: {
    marginVertical: 5,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  deleteButton: {
    marginTop: 10,
  },
});
