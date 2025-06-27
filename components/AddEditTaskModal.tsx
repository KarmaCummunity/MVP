import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Task } from "../globals";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../globals/colors"; // Assuming this defines your global color palette

/**
 * Props interface for the AddEditTaskModal component.
 * @interface AddEditTaskModalProps
 */
interface AddEditTaskModalProps {
  /**
   * Controls the visibility of the modal.
   */
  isVisible: boolean;
  /**
   * Callback function invoked when the modal is requested to close.
   */
  onClose: () => void;
  /**
   * Callback function invoked when a task is saved (either new or edited).
   * @param {Task} task - The task object to be saved.
   */
  onSave: (task: Task) => void;
  /**
   * The task object to be edited. If null, the modal is in "add new task" mode.
   */
  editingTask: Task | null;
}

/**
 * A modal component for adding a new task or editing an existing one.
 * It provides input fields for task title, due date (currently simplified), and priority.
 * It also includes auto-focus on the title input when adding a new task.
 *
 * @param {AddEditTaskModalProps} props - The props for the component.
 * @returns {React.FC<AddEditTaskModalProps>} The AddEditTaskModal component.
 */
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
  );
  const [priority, setPriority] = useState<
    "Urgent" | "Critical" | "High" | "Medium" | "Low"
  >(editingTask ? editingTask.priority : "Low");

  // --- Ref for the Task Title TextInput ---
  const titleInputRef = useRef<TextInput>(null);

  // --- useEffect to Focus TextInput on Modal Open for New Task ---
  useEffect(() => {
    // Focus the title input when the modal becomes visible and it's for a new task.
    if (isVisible && !editingTask) {
      // A small timeout helps ensure the modal is fully rendered before focusing.
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);

      // Cleanup function to clear the timeout if the component unmounts or dependencies change.
      return () => clearTimeout(timer);
    }
  }, [isVisible, editingTask]); // Dependencies: Re-run effect if these values change.

  // --- useEffect to Reset Form when editingTask changes or modal opens/closes ---
  useEffect(() => {
    // When the modal is visible, update form fields to reflect the editingTask, or clear for new task.
    if (isVisible) {
      setTitle(editingTask ? editingTask.title : "");
      setDueDate(
        editingTask?.dueDate
          ? editingTask.dueDate.toISOString().split("T")[0]
          : ""
      );
      setPriority(editingTask ? editingTask.priority : "Low");
    } else {
      // Clear form fields when the modal is closed to prepare for the next open.
      setTitle("");
      setDueDate("");
      setPriority("Low");
    }
  }, [isVisible, editingTask]); // Dependencies: Re-run effect if these values change.

  // --- Handle Save Logic ---
  const handleSave = () => {
    // Basic validation: Ensure task title is not empty.
    if (title.trim() === "") {
      Alert.alert("Error", "Task title cannot be empty.");
      return;
    }

    // Construct the task object to be saved.
    const savedTask: Task = {
      // If editing, use the existing ID; otherwise, a temporary ID will be used
      // and later replaced by the backend (e.g., Firestore).
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: title.trim(),
      // Preserve completion status if editing, otherwise default to false.
      completed: editingTask ? editingTask.completed : false,
      // Convert due date string to Date object, or set to undefined if empty.
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority,
      // Preserve creation timestamp if editing, otherwise set current date.
      createdAt: editingTask ? editingTask.createdAt : new Date(),
    };
    onSave(savedTask); // Call the onSave prop with the constructed task.
  };

  /**
   * Determines the background color for each priority button.
   * @param {"Urgent" | "Critical" | "High" | "Medium" | "Low"} p - The priority level.
   * @returns {string} The corresponding hex color code.
   */
  const getPriorityColor = (
    p: "Urgent" | "Critical" | "High" | "Medium" | "Low"
  ) => {
    switch (p) {
      case "Urgent":
        return "#D32F2F"; // A more standard and strong red (Material Design 'Red 700')
      case "Critical":
        return "#F4511E"; // A vibrant orange-red (Material Design 'Deep Orange 600')
      case "High":
        return "#FB8C00"; // A bright orange (Material Design 'Orange 600')
      case "Medium":
        return "#FFC107"; // A warm yellow/amber (Material Design 'Amber 500')
      case "Low":
        return "#4CAF50"; // A standard green (Material Design 'Green 500')
      default:
        return "#888888"; // A neutral grey for any unhandled case
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Allows closing modal on Android back button press
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {editingTask ? "Edit Task" : "Add New Task"}
          </Text>

          {/* Task Title Input */}
          <TextInput
            ref={titleInputRef} // Assign the ref to enable focusing
            style={styles.input}
            placeholder="Task Title"
            value={title}
            placeholderTextColor={"#888"} // Placeholder text color 
            onChangeText={setTitle}
            returnKeyType="done" // Changes keyboard return key text
            onSubmitEditing={handleSave} // Allows saving when pressing "done" on keyboard
          />

          {/* Due Date Input - Currently simplified. Consider using a dedicated date picker. */}
          {/* <TextInput
            style={styles.input}
            placeholder="Due Date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric"
          /> */}

          {/* Priority Picker */}
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Priority:</Text>
            {["Low", "Medium", "High", "Critical", "Urgent"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  { backgroundColor: getPriorityColor(p as any) }, // Apply dynamic color
                  priority === p && styles.priorityButtonSelected, // Apply selected style
                ]}
                onPress={() =>
                  setPriority(p as "Urgent" | "Critical" | "High" | "Medium" | "Low")
                }
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


//These styles define the visual appearance and layout of the `AddEditTaskModal` component.

const styles = StyleSheet.create({
  // Centers the modal content on the screen with a semi-transparent background.
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  // Styles for the main modal content container.
  modalView: {
    margin: 20,
    backgroundColor: colors.lightOrange, // Uses a global color
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
    width: "90%", // Takes 90% of the parent width
    maxWidth: 400, // Limits the maximum width for larger screens
  },
  // Title style for "Add New Task" or "Edit Task".
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  // Styles for the TextInput fields.
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
  // Container for the priority selection buttons.
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around", // Distributes buttons evenly
    width: "100%", // Takes full width of its parent
    flexWrap: "wrap", // Allows buttons to wrap to the next line if space is limited
    marginBottom: 15, // Added some bottom margin for spacing
  },
  // Label for the priority section.
  priorityLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: "#555",
  },
  // Basic style for each priority button.
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 70,
    alignItems: "center",
    marginHorizontal: 4, // Spacing between buttons
    marginVertical: 5, // Vertical spacing in case of wrapping
  },
  // Style applied to the currently selected priority button.
  priorityButtonSelected: {
    borderColor: "#007AFF", // Highlight with a distinct border color
    borderWidth: 2,
  },
  // Text style for the priority buttons.
  priorityButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Container for the action buttons (Cancel and Save).
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
});

export default AddEditTaskModal;