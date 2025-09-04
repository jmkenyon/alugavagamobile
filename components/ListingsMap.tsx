import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import { defaultStyles } from "@/constants/Styles";
import { useRouter } from "expo-router";
import MapView from "react-native-map-clustering";

interface Props {
  listings: any;
}

const INITIAL_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const ListingsMap = ({ listings }: Props) => {
  const router = useRouter();
  const onMarketSelected = (item: any) => {
    router.push(`/anuncio/${item.id}`);
  };

  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={`cluster-${id}`}
        onPress={onPress}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
      >
        <View style={styles.marker}>
          <Text
            style={{
              color: "#000",
              textAlign: "center",
              fontFamily: "inter-sb",
            }}
          >
            {points}
          </Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={[defaultStyles.container, { marginTop: 0 }]}>
      <MapView
        animationEnabled={false}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton
        initialRegion={INITIAL_REGION}
        clusterColor="#fff"
        clusterTextColor="#000"
        clusterFontFamily="inter-sb"
        renderCluster={renderCluster}
      >
        {listings.map((listing: any) => (
          <Marker
            key={listing.id}
            onPress={() => onMarketSelected(listing)}
            coordinate={{
              latitude: listing.lat,
              longitude: listing.lng,
            }}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>{`R$ ${listing.price}`}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marker: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 10 },
  },
  markerText: {
    fontSize: 14,
    fontFamily: "inter-sb",
  },
});

export default ListingsMap;
