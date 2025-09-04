import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useMemo, useRef } from "react";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetHandle,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Listings from "./Listings";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList";

interface Props {
  listings: any[];
}

const ListingsBottomSheet = ({ listings }: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["10%", "99%"], []);
  const [refresh, setRefresh] = React.useState(0);

  const showMap = () => {
    bottomSheetRef.current?.collapse();
    setRefresh(refresh + 1);
  };

  return (

<BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={1}>
    <Listings listings={listings} refresh={refresh} />
  

  <View style={styles.absoluteBtn}>
    <TouchableOpacity onPress={showMap} style={styles.btn}>
      <Text style={{ fontFamily: "inter-sb", color: "#fff" }}>Mapa</Text>
      <Ionicons name="map" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
</BottomSheet>
  );
};

const styles = StyleSheet.create({
  absoluteBtn: {
    position: "absolute",
    bottom: 130,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 50,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 30,
    gap: 8,
  },
  sheetContainer: {
    backgroundColor: "#fff",
    elevation: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 1 },
  },
  relative: {
    position: "relative",
  }
});

export default ListingsBottomSheet;
