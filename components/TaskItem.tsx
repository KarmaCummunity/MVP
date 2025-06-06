// TaskItem.tsx
'use strict'; // Enforces strict parsing and error handling for cleaner code.

// Core React imports and components from React Native.
import React, { useCallback, memo } from 'react'; // Added `memo` for performance, `useCallback` for function memoization.
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

// Type definition for Task, assuming it's globally defined or in `globals.ts`.
import { Task } from '../globals';
// Icon component using MaterialIcons. Ensure `react-native-vector-icons` is installed.
import Icon from 'react-native-vector-icons/MaterialIcons';
// Centralized color constants for consistent theming.
import colors from '../globals/colors';

/**
 * @typedef {object} TaskItemProps
 * @property {Task} task - The task object to display.
 * @property {(id: string) => void} onToggleComplete - Callback function to toggle task completion status.
 * @property {(task: Task) => void} onEditTask - Callback function to edit the task.
 * @property {(id: string) => void} onDeleteTask - Callback function to delete the task.
 */
interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

/**
 * TaskItem Component
 *
 * This component displays a single task item in a list, including its title,
 * due date, priority, and actions like toggling completion, editing, and deleting.
 *
 * Wrapped in `React.memo` for performance optimization, preventing unnecessary re-renders
 * if its props do not change.
 */
const TaskItem: React.FC<TaskItemProps> = memo(({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  // --- LOG: TaskItem rendered (uncomment to enable) ---
  // console.log(`TaskItem: Task "${task.title}" rendered. Completed: ${task.completed}`);

  /**
   * `getPriorityColor` function:
   * Determines the background color of the priority badge based on the task's priority level.
   * Wrapped in `useCallback` to memoize the function, preventing its re-creation on every render.
   * @param {Task['priority']} priority - The priority level of the task.
   * @returns {string} The hex color string for the priority badge.
   */
  const getPriorityColor = useCallback((priority: Task['priority']): string => {
    switch (priority) {
      case 'High':
        return colors.priorityHigh; // Red color from colors.js
      case 'Medium':
        return colors.priorityMedium; // Yellow/Orange color from colors.js
      case 'Low':
        return colors.priorityLow; // Green color from colors.js
      default:
        return colors.priorityDefault; // Default gray color from colors.js
    }
  }, []); // Empty dependency array means this function is created once.

  return (
    // Main container for a single task item.
    // Applies `completedContainer` style conditionally if the task is completed.
    <View style={[localStyles.container, task.completed && localStyles.completedContainer]}>
      {/*
        // Original TouchableOpacity around Switch was commented out. Keeping it commented out
        // as per "without changing any logic at all". The Switch itself handles the touch event.
        // <TouchableOpacity onPress={() => onToggleComplete(task.id)} style={localStyles.checkboxContainer}>
      */}
        {/* Switch component for toggling task completion status. */}
        <Switch
          value={task.completed}
          onValueChange={() => {
            // --- LOG: Toggle complete for task (uncomment to enable) ---
            // console.log(`TaskItem: Toggling completion for "${task.title}". New status: ${!task.completed}`);
            onToggleComplete(task.id);
          }}
          // Define track colors for the Switch (when false/true).
          trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
          // Define thumb color based on completion status.
          thumbColor={task.completed ? colors.switchThumbCompleted : colors.switchThumbDefault}
        />
      {/* </TouchableOpacity> */}

      {/* Container for task details (title, due date, priority). */}
      <View style={localStyles.detailsContainer}>
        {/* Task title, applying line-through and different color if completed. */}
        <Text
          style={[
            localStyles.title,
            task.completed && localStyles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        {/* Display due date only if it exists. */}
        {task.dueDate && (
          <Text style={localStyles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
        {/* Priority badge, with background color determined by `getPriorityColor`. */}
        <View style={[localStyles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={localStyles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      {/* Container for action buttons (edit, delete). */}
      <View style={localStyles.actionsContainer}>
        {/* Edit Task Button */}
        <TouchableOpacity
          onPress={() => {
            // --- LOG: Edit task button pressed (uncomment to enable) ---
            // console.log(`TaskItem: Edit button pressed for "${task.title}".`);
            onEditTask(task);
          }}
          style={localStyles.actionButton}
        >
          <Icon name="edit" size={24} color={colors.mediumGray} /> {/* Icon color from colors.js */}
        </TouchableOpacity>
        {/* Delete Task Button */}
        <TouchableOpacity
          onPress={() => {
            // --- LOG: Delete task button pressed (uncomment to enable) ---
            // console.log(`TaskItem: Delete button pressed for "${task.title}".`);
            onDeleteTask(task.id);
          }}
          style={localStyles.actionButton}
        >
          <Icon name="delete" size={24} color={colors.deleteRed} /> {/* Icon color from colors.js */}
        </TouchableOpacity>
      </View>
    </View>
  );
}); // `memo` ends here.

/**
 * localStyles:
 * Defines styles specific to the TaskItem component.
 * These styles are generally not reused across other components.
 */
const localStyles = StyleSheet.create({
  /**
   * Main container for each task item.
   * Arranges content in a row, with background color and shadow for visual elevation.
   */
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mediumOrange, // Background color from colors.js
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2, // Android shadow property
    shadowColor: colors.black, // iOS shadow color from colors.js
    shadowOffset: { width: 0, height: 1 }, // iOS shadow offset
    shadowOpacity: 0.2, // iOS shadow opacity
    shadowRadius: 1.41, // iOS shadow blur radius
  },
  /**
   * Additional styles applied when a task is marked as completed.
   * Reduces opacity and changes background for visual distinction.
   */
  completedContainer: {
    opacity: 0.7,
    backgroundColor: colors.completedBackground, // Background color from colors.js
  },
  /**
   * Removed `checkboxContainer` style as its corresponding `TouchableOpacity` in JSX is commented out.
   * If re-enabled, this style might be needed.
   */
  // checkboxContainer: {
  //   marginRight: 15,
  // },
  /**
   * Container for the task's textual details (title, due date, priority).
   * Takes up available space using `flex: 1`.
   */
  detailsContainer: {
    flex: 1,
  },
  /**
   * Styling for the task title.
   */
  title: {
    fontSize: 14,
    fontWeight: '500', // Medium font weight
    color: colors.darkGray, // Text color from colors.js
  },
  /**
   * Additional styling for the task title when the task is completed.
   * Adds a line-through decoration and changes text color.
   */
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.completedText, // Text color from colors.js
  },
  /**
   * Styling for the task's due date text.
   */
  dueDate: {
    fontSize: 10,
    color: colors.darkGray, // Text color from colors.js
    marginTop: 4,
  },
  /**
   * Styling for the task priority badge.
   * `alignSelf: 'flex-start'` ensures the badge doesn't stretch horizontally.
   */
  priorityBadge: {
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15, // Makes it rounded
    alignSelf: 'flex-start',
  },
  /**
   * Text styling within the priority badge.
   */
  priorityText: {
    fontSize: 10,
    color: colors.white, // Text color from colors.js
    fontWeight: 'bold',
  },
  /**
   * Container for the edit and delete action buttons.
   */
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  /**
   * Styling for individual action buttons.
   */
  actionButton: {
    marginLeft: 10, // Space between buttons
    padding: 5, // Provides a larger touchable area
  },
});

export default TaskItem;

// GENERAL SUGGESTIONS FOR EFFICIENCY AND BEST PRACTICES:

// 1. `React.memo` for List Items:
//    Wrapping `TaskItem` in `React.memo` (as done above) is a significant performance improvement
//    for components rendered in lists (like FlatList or ScrollView). It prevents `TaskItem`
//    from re-rendering if its props (`task`, `onToggleComplete`, `onEditTask`, `onDeleteTask`)
//    haven't changed, reducing unnecessary UI updates.

// 2. `useCallback` for Callbacks:
//    Using `useCallback` for `getPriorityColor` helps ensure that this helper function is
//    not re-created on every render, which can be beneficial if it were passed down
//    to child components as a prop. For a simple switch statement called internally,
//    the performance gain is minimal but it's good practice.

// 3. Icon Library Installation:
//    Ensure `react-native-vector-icons` is properly installed and linked in your project,
//    as the `Icon` component from this library is used. The comment in your original file
//    suggests it might not be. Follow its installation guide for native linking.

// 4. Custom Checkbox vs. Switch:
//    You have a `Switch` component, but the original code had a `TouchableOpacity` around it
//    that was commented out. If you need a custom checkbox look and feel that's not achievable
//    with `Switch`'s `trackColor` and `thumbColor` props, consider implementing a custom
//    checkbox component using `TouchableOpacity` and `MaterialIcons` (e.g., `check-box` or `check-box-outline-blank`).
//    This offers more control over the visual appearance of a checkbox.

// 5. Date Formatting:
//    `new Date(task.dueDate).toLocaleDateString()` is suitable for display. If you need
//    more advanced or customizable date formatting, libraries like `moment.js` or `date-fns`
//    are popular choices, but add to bundle size. For simple display, `toLocaleDateString` is efficient enough.