import React, { useState, useEffect, useRef } from "react"; // <--- Import useRef and useEffect
import {
  Modal,
  View,
  Text,
  TextInput, // <--- Ensure TextInput is imported
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert, // Assuming Alert is used for validation
} from "react-native";
import { Task } from "../globals"; // Assuming Task interface is here
import Icon from "react-native-vector-icons/MaterialIcons"; // Assuming you might use icons for priority/date pickers
import Colors from "../globals/Colors";

// Define the props interface for the modal
interface AddEditTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  editingTask: Task | null; // Null if adding a new task
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  isVisible,
  onClose,
  onSave,
  editingTask,
}) => {
  // --- State for Task Details ---
  const [title, setTitle] = useState(editingTask ? editingTask.title : "");
  const [dueDate, setDueDate] = useState<string>(
    editingTask?.dueDate ? editingTask.dueDate.toISOString().split("T")[0] : ""
  ); // For date picker, typically string format
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">(
    editingTask ? editingTask.priority : "Low"
  );

  // --- Ref for the Task Title TextInput ---
  const titleInputRef = useRef<TextInput>(null); // Create a ref that will point to the TextInput

  // --- useEffect to Focus TextInput on Modal Open for New Task ---
  useEffect(() => {
    // This effect runs whenever 'isVisible' or 'editingTask' changes.
    // We want to focus the input ONLY when the modal becomes visible AND it's for adding a new task (not editing).
    if (isVisible && !editingTask) {
      // A small timeout can sometimes help ensure the modal is fully rendered
      // before attempting to focus the input, especially on Android devices.
      const timer = setTimeout(() => {
        titleInputRef.current?.focus(); // Attempt to focus the input field
      }, 100); // 100ms delay

      // Cleanup function: If the modal closes before the timeout fires, clear the timeout
      return () => clearTimeout(timer);
    }
  }, [isVisible, editingTask]); // Dependencies: Re-run effect if these values change

  // --- useEffect to Reset Form when editingTask changes ---
  // This ensures the form fields correctly reflect the editingTask when editing,
  // or are cleared when switching to 'add new task' mode.
  useEffect(() => {
    if (isVisible) {
      setTitle(editingTask ? editingTask.title : "");
      setDueDate(
        editingTask?.dueDate
          ? editingTask.dueDate.toISOString().split("T")[0]
          : ""
      );
      setPriority(editingTask ? editingTask.priority : "Low");
    } else {
      // Clear form fields when modal is closed
      setTitle("");
      setDueDate("");
      setPriority("Low");
    }
  }, [isVisible, editingTask]);

  // --- Handle Save Logic ---
  const handleSave = () => {
    if (title.trim() === "") {
      Alert.alert("Error", "Task title cannot be empty.");
      return;
    }

    const savedTask: Task = {
      // If editing, use the existing ID; otherwise, Firestore generates it.
      // The local ID (Date.now().toString()) is a placeholder that will be replaced by Firestore's ID.
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: title.trim(),
      completed: editingTask ? editingTask.completed : false, // Preserve completion status if editing
      dueDate: dueDate ? new Date(dueDate) : undefined, // Convert string date to Date object
      priority: priority,
      createdAt: editingTask ? editingTask.createdAt : new Date(), // Placeholder; Firestore will use serverTimestamp()
    };
    onSave(savedTask); // Call the onSave prop passed from parent
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Android back button closes modal
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {editingTask ? "Edit Task" : "Add New Task"}
          </Text>

          {/* Task Title Input */}
          <TextInput
            ref={titleInputRef} // <--- Assign the ref here
            style={styles.input}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done" // Changes keyboard return key text
            onSubmitEditing={handleSave} // Optionally save when done typing
          />

          {/* Due Date Input (simplified, you might use a date picker here) */}
          {/* <TextInput
            style={styles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric" // Suggest numeric keyboard for date
          /> */}

          {/* Priority Picker (simplified, you might use a Picker/Dropdown) */}
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Priority:</Text>
            {["Low", "Medium", "High"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonSelected,
                  // --- NEW COLORS ---
                  p === "High" && { backgroundColor: "#E74C3C" }, // Muted Red
                  p === "Medium" && { backgroundColor: "#F39C12" }, // Muted Orange
                  p === "Low" && { backgroundColor: "#27AE60" }, // Muted Green
                ]}
                onPress={() => setPriority(p as "High" | "Medium" | "Low")}
              >
                <Text style={styles.priorityButtonText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} color="#888" />
            <Button title="Save" onPress={handleSave} color="#007AFF" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Stylesheet for the Modal ---
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.lightOrange,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%", // Adjust width as needed
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    width: "100%",
    justifyContent: "space-around", // Keeps buttons distributed
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: "#555",
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 70,
    alignItems: "center",
    marginHorizontal: 5, // <--- ADDED FOR SPACING BETWEEN BUTTONS
  },

  priorityButtonSelected: {
    borderColor: "#007AFF", // Highlight selected priority
    borderWidth: 2,
  },
  priorityButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    marginHorizontal: 10, // <--- ADDED FOR SPACING
  },
});

export default AddEditTaskModal;
