import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";

interface SavedResult {
  foodItem: string;
  carbValue: number;
  date: string;
  timestamp: number;
}
const App = () => {
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const [foodItem, setFoodItem] = useState("");
  const [carbValue, setCarbValue] = useState(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);

  useEffect(() => {
    const loadSavedResults = async () => {
      try {
        //await AsyncStorage.clear();
        const storedResults = await AsyncStorage.getItem("savedResults");
        if (storedResults) {
          console.log(JSON.parse(storedResults));
          setSavedResults(JSON.parse(storedResults));
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load saved results");
      }
    };

    loadSavedResults();
  }, []);

  const fetchCarbValue = async () => {
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${foodItem}`
      );
      const data = await response.json();
      if (data.foods && data.foods.length > 0) {
        const foodId = data.foods[0].fdcId;

        const foodResponse = await fetch(
          `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${API_KEY}`
        );
        const foodData = await foodResponse.json();
        if (foodData.foodNutrients) {
          const carbNutrient = foodData.foodNutrients.find(
            (foodNutrient: any) =>
              foodNutrient.nutrient.name === "Carbohydrate, by difference"
          );
          console.log(carbNutrient);
          if (carbNutrient) {
            setCarbValue(carbNutrient.amount);
          } else {
            Alert.alert("Error", "Carbohydrate value not found");
          }
        } else {
          Alert.alert("Error", "Nutrient data not available");
        }
      } else {
        Alert.alert("Error", "Food item not found");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data");
    }
  };

  const saveResult = async () => {
    if (carbValue !== null) {
      const newResult: SavedResult = {
        foodItem,
        carbValue,
        date: format(new Date(), "yyyy-MM-dd"),
        timestamp: new Date().getTime(),
      };
      const updatedResults = [...savedResults, newResult];
      setSavedResults(updatedResults);
      try {
        await AsyncStorage.setItem(
          "savedResults",
          JSON.stringify(updatedResults)
        );
        Alert.alert(`Success', 'Result saved successfully`);
      } catch (error) {
        Alert.alert("Error", "Failed to save result");
      }
    } else {
      Alert.alert("Error", "No carb value to save");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Ionicons size={310} name="code-slash" style={styles.headerImage} />
      }
    >
      <View style={styles.container}>
        <Text style={styles.label}>Enter Food Item:</Text>
        <TextInput
          style={styles.input}
          value={foodItem}
          onChangeText={setFoodItem}
        />
        <Button title="Calculate Carbs" onPress={fetchCarbValue} />
        {carbValue !== null && (
          <Text style={styles.result}>
            Carb value for {foodItem}: {carbValue} grams
          </Text>
        )}
        <Button title="Save Result" onPress={saveResult} />
      </View>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  result: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default App;
