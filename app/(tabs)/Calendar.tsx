// CalendarScreen.js
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState<{
    [date: string]: {
      totalCarbs: number;
      foodItems: [
        {
          carbs: number;
          marked: boolean;
          dotColor: string;
          food: string;
          timestamp: number;
        }
      ];
    };
  }>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dailyTotal, setDailyTotal] = useState<number>(0);

  useEffect(() => {
    loadSavedResults();
  }, []);

  const loadSavedResults = useCallback(async () => {
    try {
      const storedResults = await AsyncStorage.getItem("savedResults");
      if (storedResults) {
        const results = JSON.parse(storedResults);
        const dates = results.reduce(
          (
            acc: {
              [date: string]: {
                foodItems: [
                  {
                    carbs: number;
                    marked: boolean;
                    dotColor: string;
                    food: string;
                    timestamp: number;
                  }
                ];
                totalCarbs: number;
              };
            },
            result: {
              foodItem: any;
              carbValue: number;
              date: string;
              timestamp: number;
            }
          ) => {
            const date = result.date;
            if (!acc[date]) {
              acc[date] = {
                totalCarbs: result.carbValue,
                foodItems: [
                  {
                    carbs: result.carbValue,
                    marked: true,
                    dotColor: "blue",
                    food: result.foodItem,
                    timestamp: result.timestamp,
                  },
                ],
              };
            }
            acc[date].totalCarbs += result.carbValue;
            acc[date].foodItems.push({
              carbs: result.carbValue,
              marked: true,
              dotColor: "blue",
              food: result.foodItem,
              timestamp: result.timestamp,
            });
            return acc;
          },
          {}
        );
        console.log(dates);
        setMarkedDates(dates);
      }
    } catch (error) {
      console.error("Error loading saved results", error);
    }
  }, []);

  const onDayPress = (day: { dateString: string }) => {
    loadSavedResults();
    setSelectedDate(day.dateString);
    setDailyTotal(markedDates[day.dateString]?.totalCarbs || 0);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={"simple"}
      />
      {selectedDate ? (
        <>
          <Text style={styles.total}>
            Total carbs for {selectedDate}: {dailyTotal} grams
          </Text>
          <View>
            {markedDates[selectedDate]?.foodItems?.map((foodItem, index) => (
              <Text key={index}>
                {foodItem.food} - {foodItem.carbs} grams
              </Text>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.total}>Select a date to see total carbs</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  total: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default CalendarScreen;
