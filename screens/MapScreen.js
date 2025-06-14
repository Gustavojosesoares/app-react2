import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import dogIcon from '../assets/dog-marker.png';

export default function MapScreen() {
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      const response = await fetch('https://lost-animals-backend.onrender.com/lostanimals');
      const data = await response.json();
      setAnimais(data);
    } catch (error) {
      console.error('Erro ao carregar animais no mapa:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -8.0476,
          longitude: -34.877,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {animais.map((animal) => (
          <Marker
            key={animal._id}
            coordinate={{
              latitude: animal.latitude,
              longitude: animal.longitude,
            }}
            title={animal.breed}
            description={animal.description}
            image={dogIcon}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
