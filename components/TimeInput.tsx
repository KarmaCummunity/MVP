// components/TimeInput.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface TimeInputProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
}

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export default function TimeInput({ value, onChange, label }: TimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState<Date>(value || new Date());

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    setShowPicker(false);
    if (selectedDate) {
      setTime(selectedDate);
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {Platform.OS === "web" ? (
        <TextInput
          style={styles.input}
          value={formatTime(time)}
          onChangeText={(text) => {
            const [h, m] = text.split(":").map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              const updated = new Date();
              updated.setHours(h, m);
              setTime(updated);
              onChange(updated);
            }
          }}
          placeholder="HH:MM"
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.input}
          >
            <Text>{formatTime(time)}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              mode="time"
              display="default"
              value={time}
              onChange={handleChange}
              is24Hour={true}
            />
          )}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      alignSelf: "flex-end", // Make container as small as needed
      marginBottom: 10,
    },
    label: {
      marginBottom: 4,
      fontSize: 14,
      fontWeight: "bold",
      textAlign: "right",
    },
    input: {
      minWidth: 80,             // Just enough for "HH:MM"
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderRadius: 6,
      borderColor: "#ccc",
      backgroundColor: "#f9f9f9",
      justifyContent: "center",
      alignItems: "center",
    },
  });
  