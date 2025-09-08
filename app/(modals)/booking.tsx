import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { BlurView } from "expo-blur";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import { defaultStyles } from "@/constants/Styles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import moment from "moment";
import CheckBox from "@/components/CheckBox";
import MapSearchBox from "@/components/MapSearchBox";
import { fetchListings } from "@/lib/api/fetchListings";
import ListingsBottomSheet from "@/components/ListingsBottomSheet";

//@ts-ignore
import DatePicker from "react-native-modern-datepicker";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const booking = () => {
  const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);
  const router = useRouter();
  const [openCard, setOpenCard] = React.useState(0);
  const today = moment().format("YYYY/MM/DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookingType, setBookingType] = useState<
    "nao_sei" | "mensal" | "datas" | ""
  >("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showStartCalendar, setShowStartCalendar] = useState(true);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [monthlyStartKnown, setMonthlyStartKnown] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [searchLat, setSearchLat] = useState<number | null>(null);
  const [searchLng, setSearchLng] = useState<number | null>(null);
  const [listings, setListings] = useState<any[]>([]);

  const onClearAll = () => {
    setOpenCard(0);
    setBookingType("");
    setStartDate("");
    setEndDate("");
    setCollapsed(false);
    setSelectedAddress("");
  };

  const portugueseConfigs = {
    dayNames: [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
  };

  const handleBuscar = async () => {

    if (bookingType === "datas" && (!startDate || !endDate)) {
      console.warn("Start or end date missing. Aborting fetch.");
      return;
    }

    try {
      const params: any = { lat: searchLat, lng: searchLng };

      if (bookingType === "datas" && startDate && endDate) {
        // convert to ISO-8601
        const isoStart = startDate.replace(/\//g, "-") + "T00:00:00.000Z";
        const isoEnd = endDate.replace(/\//g, "-") + "T23:59:59.999Z";

        params.startDate = isoStart;
        params.endDate = isoEnd;
        console.log("📅 Date range:", params.startDate, "to", params.endDate);
        console.log("📤 Sending to backend:", params);
      }

      const results = await fetchListings(params);
      setListings(results);
    } catch (err) {
      console.error("❌ Error fetching listings:", err);
    }
  };
  return (
    <GestureHandlerRootView>
      <BlurView intensity={70} style={styles.container} tint="light">
        {/* Where */}

        <View style={styles.card}>
          {openCard != 0 && (
            <AnimatedTouchableOpacity
              onPress={() => setOpenCard(0)}
              style={styles.cardPreview}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Text style={styles.previewText}>Onde?</Text>
            </AnimatedTouchableOpacity>
          )}

          {openCard === 0 && (
            <>
              <Animated.Text entering={FadeIn} style={styles.cardHeader}>
                Onde quer estacionar?
              </Animated.Text>
              <Animated.View style={styles.cardBody}>
                <MapSearchBox
                  mapboxToken="pk.eyJ1IjoiYWx1Z2F2YWdhIiwiYSI6ImNtZTAyZXo2eTAwZzYyanNhbDhzeWFhcHUifQ.rgYUg_mpl5nvP5AboikC6Q"
                  onSelect={(place) => {
                    setSelectedAddress(place.place_name);
                    setSearchLat(place.center[1]); // latitude
                    setSearchLng(place.center[0]); // longitude
                  }}
                  value={selectedAddress}
                />
              </Animated.View>
            </>
          )}
        </View>
        {/* When */}
        <View style={styles.card}>
          {openCard != 1 && (
            <AnimatedTouchableOpacity
              onPress={() => setOpenCard(1)}
              style={styles.cardPreview}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Text style={styles.previewText}>Quando?</Text>
            </AnimatedTouchableOpacity>
          )}
          {openCard === 1 && (
            <ScrollView>
              <Animated.Text entering={FadeIn} style={styles.cardHeader}>
                Quando precisa estacionar?
              </Animated.Text>
              <Animated.View style={styles.cardBody}>
                <View>
                  {collapsed ? (
                    <>
                      {/* Only show the selected option */}
                      {bookingType === "nao_sei" && (
                        <CheckBox
                          label="Não sei ainda"
                          checked
                          onPress={() => {}}
                        />
                      )}
                      {bookingType === "mensal" && (
                        <CheckBox
                          label="Mensalmente"
                          checked
                          onPress={() => {}}
                        />
                      )}
                      {bookingType === "datas" && (
                        <CheckBox
                          label="Datas específicos"
                          checked
                          onPress={() => {}}
                        />
                      )}
                      {/* Clear button to expand again */}
                      <TouchableOpacity
                        style={{ marginTop: 10 }}
                        onPress={() => {
                          setCollapsed(false);
                          setBookingType(""); // reset selection
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 2,
                            gap: 2,
                          }}
                          onPress={() => {
                            setCollapsed(false);
                            setBookingType("");
                            setStartDate("");
                            setEndDate("");
                            setShowStartCalendar(true);
                            setShowEndCalendar(false);
                            setSelectedDate(today);
                          }}
                        >
                          <Ionicons name="close" size={14} color="red" />
                          <Text
                            style={{
                              fontFamily: "inter",
                              fontSize: 14,
                              color: "red",
                            }}
                          >
                            Limpar
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <CheckBox
                        label="Não sei ainda"
                        checked={bookingType === "nao_sei"}
                        onPress={() => {
                          setBookingType("nao_sei");
                          setCollapsed(true);
                        }}
                      />
                      <CheckBox
                        label="Mensalmente"
                        checked={bookingType === "mensal"}
                        onPress={() => {
                          setBookingType("mensal");
                          setCollapsed(true);
                        }}
                      />
                      <CheckBox
                        label="Datas específicos"
                        checked={bookingType === "datas"}
                        onPress={() => {
                          setBookingType("datas");
                          setCollapsed(true);
                        }}
                      />
                    </>
                  )}
                </View>
                {bookingType === "datas" && (
                  <View>
                    {showStartCalendar ? (
                      <>
                        <Text style={styles.select}>
                          Selecione a data inicial
                        </Text>
                        <DatePicker
                          options={{
                            mainColor: Colors.primary,
                            textHeaderColor: "#000",
                            textDefaultColor: "#000",
                            textSecondaryColor: Colors.subtext,
                          }}
                          mode="Calendar"
                          minimumDate={today}
                          current={today}
                          selected={selectedDate}
                          onSelectedChange={(date: string) =>
                            setSelectedDate(date)
                          }
                          onDateChange={(date: string) => setSelectedDate(date)}
                          configs={portugueseConfigs}
                          isGregorian={true}
                        />
                        {selectedDate && (
                          <TouchableOpacity
                            onPress={() => {
                              setStartDate(selectedDate);
                              setShowEndCalendar(true);
                              setShowStartCalendar(false);
                            }}
                            style={styles.btn}
                          >
                            <Text style={defaultStyles.btnText}>Próximo</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <>
                        <Text style={styles.select}>
                          Selecione a data final
                        </Text>
                        <DatePicker
                          options={{
                            mainColor: Colors.primary,
                            textHeaderColor: "#000",
                            textDefaultColor: "#000",
                            textSecondaryColor: Colors.subtext,
                          }}
                          mode="Calendar"
                          minimumDate={startDate}
                          current={startDate}
                          selected={selectedDate}
                          onSelectedChange={(date: string) =>
                            setSelectedDate(date)
                          }
                          onDateChange={(date: string) => setEndDate(date)}
                          configs={portugueseConfigs}
                          isGregorian={true}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setShowStartCalendar(true);
                              setShowEndCalendar(false);
                              setSelectedDate(startDate);
                              setEndDate("");

                            }}
                            style={styles.calendarBtn}
                          >
                            <Text style={defaultStyles.btnText}>Voltar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEndDate(selectedDate);
                              setShowEndCalendar(false);
                              handleBuscar();
                            }}
                            style={styles.calendarBtn}
                          >
                            <Text style={defaultStyles.btnText}>Buscar</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {bookingType === "mensal" && (
                  <View>
                    <Text
                      style={[
                        styles.previewText,
                        { marginTop: 15, marginBottom: 10 },
                      ]}
                    >
                      Sabe quando você pretende iniciar?
                    </Text>
                    <TouchableOpacity
                      onPress={() => setMonthlyStartKnown(true)}
                    >
                      <CheckBox
                        label="Sim"
                        checked={monthlyStartKnown === true}
                        onPress={() => setMonthlyStartKnown(true)}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMonthlyStartKnown(false)}
                    >
                      <CheckBox
                        label="Não"
                        checked={monthlyStartKnown === false}
                        onPress={() => setMonthlyStartKnown(false)}
                      />
                    </TouchableOpacity>

                    {monthlyStartKnown ? (
                      <DatePicker
                        options={{
                          mainColor: Colors.primary,
                          textHeaderColor: "#000",
                          textDefaultColor: "#000",
                          textSecondaryColor: Colors.subtext,
                        }}
                        mode="Calendar"
                        minimumDate={today}
                        current={today}
                        selected={selectedDate}
                        onSelectedChange={(date: string) =>
                          setSelectedDate(date)
                        }
                        onDateChange={(date: string) => setSelectedDate(date)}
                        configs={portugueseConfigs}
                        isGregorian={true}
                      />
                    ) : (
                      <View style={{ alignItems: "center" }}>
                        <TouchableOpacity
                          onPress={handleBuscar}
                          style={styles.naoSeiBtn}
                        >
                          <Ionicons
                            name="search-outline"
                            size={24}
                            color="#fff"
                            style={defaultStyles.btnIcon}
                          />
                          <Text style={defaultStyles.btnText}>Buscar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {bookingType === "nao_sei" && (
                  <View style={{ alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={handleBuscar}
                      style={styles.naoSeiBtn}
                    >
                      <Ionicons
                        name="search-outline"
                        size={24}
                        color="#fff"
                        style={defaultStyles.btnIcon}
                      />
                      <Text style={defaultStyles.btnText}>Buscar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          )}
        </View>
        {/* Footer */}
        <Animated.View
          style={defaultStyles.footer}
          entering={SlideInDown.delay(200)}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={onClearAll}
              style={{ justifyContent: "center" }}
            >
              <Text
                style={{
                  fontFamily: "inter-sb",
                  fontSize: 18,
                  color: "#000",
                  textDecorationLine: "underline",
                }}
              >
                Limpar tudo
              </Text>
            </TouchableOpacity>
            <View>
              {(bookingType === "mensal" || bookingType === "") &&
                monthlyStartKnown !== false && (
                  <TouchableOpacity
                    onPress={handleBuscar}
                    style={[
                      defaultStyles.btn,
                      { paddingRight: 20, paddingLeft: 50 },
                    ]}
                  >
                    <Ionicons
                      name="search-outline"
                      size={24}
                      color="#fff"
                      style={defaultStyles.btnIcon}
                    />
                    <Text style={defaultStyles.btnText}>Buscar</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </Animated.View>

        {listings.length > 0 && <ListingsBottomSheet listings={listings} customSnapPoints={["10%", "90%"]}/>}
      </BlurView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 2 },
    gap: 20,
  },
  previewText: {
    fontFamily: "inter-sb",
    fontSize: 16,
    color: "#000",
  },
  cardPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  cardHeader: {
    fontFamily: "inter-b",
    fontSize: 22,
    padding: 20,
    paddingBottom: 15,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchSection: {
    height: 50,
    flexDirection: "row",
    borderColor: Colors.subtext,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  searchIcon: {
    padding: 10,
  },
  naoSeiBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    width: 300,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  select: {
    fontFamily: "inter-sb",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  btn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },
  calendarBtn: {
    width: 150,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 10,
    marginTop: -30,
  },
});

export default booking;
