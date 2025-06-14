import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function AddAnimalScreen() {
  const [raca, setRaca] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    pegarLocalizacaoAtual();
  }, []);

  const pegarLocalizacaoAtual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'A permissão para acessar a localização foi negada.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocalizacao(location.coords);
  };

  const escolherImagem = async () => {
    Alert.alert('Selecionar imagem', 'Escolha uma opção', [
      {
        text: 'Câmera',
        onPress: async () => {
          const camPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!camPerm.granted) return;
          const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
          if (!result.canceled) setFoto(result.assets[0].uri);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const galPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!galPerm.granted) return;
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });
          if (!result.canceled) setFoto(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const salvar = async () => {
    if (!raca || !descricao || !foto || !localizacao) {
      Alert.alert('Atenção', 'Preencha todos os campos e selecione a localização.');
      return;
    }

    setCarregando(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(foto, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const extensao = foto.split('.').pop().toLowerCase();
      const tipo = extensao === 'jpg' ? 'jpeg' : extensao;
      const fotoBase64 = `data:image/${tipo};base64,${base64}`;

      const dados = {
        breed: raca,
        description: descricao,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        photo: fotoBase64,
      };

      const response = await fetch('https://lost-animals-backend.onrender.com/lostanimals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      setCarregando(false);

      if (response.ok) {
        Alert.alert('Sucesso', 'Animal cadastrado!');
        setRaca('');
        setDescricao('');
        setFoto(null);
        setLocalizacao(null);
        pegarLocalizacaoAtual(); // volta para localização padrão após salvar
      } else {
        const erro = await response.text();
        Alert.alert('Erro ao salvar', erro);
      }
    } catch (error) {
      setCarregando(false);
      console.error(error);
      Alert.alert('Erro de conexão', 'Não foi possível salvar o animal.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Cadastro de Animal Perdido</Title>
      <TextInput label="Raça" value={raca} onChangeText={setRaca} style={styles.input} />
      <TextInput
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        style={styles.input}
      />
      <Button mode="contained" onPress={escolherImagem} style={styles.input}>
        Escolher Foto (Câmera/Galeria)
      </Button>
      {foto && <Image source={{ uri: foto }} style={styles.image} />}

      <Title style={{ marginTop: 20 }}>Toque no mapa para definir a localização:</Title>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: localizacao?.latitude || -8.0476,
            longitude: localizacao?.longitude || -34.877,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={
            localizacao && {
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
          }
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setLocalizacao({ latitude, longitude });
          }}
        >
          {localizacao && <Marker coordinate={localizacao} />}
        </MapView>
      </View>

      <Button
        mode="contained"
        onPress={salvar}
        loading={carregando}
        disabled={carregando}
        style={styles.input}
      >
        Salvar Animal
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
