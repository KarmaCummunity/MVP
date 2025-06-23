import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform, // Used for StatusBar.currentHeight to adjust for Android
} from 'react-native';
// --- Local Component Imports ---
import TaskItem from '../components/TaskItem';
import AddEditTaskModal from '../components/AddEditTaskModal';
import FilterSortOptions from '../components/FilterSortOptions';
import { Task, Filter, SortBy, SortOrder } from '../globals'; // Importing shared types
import Icon from 'react-native-vector-icons/MaterialIcons'; // Material Design Icons
// --- Firebase Imports ---
// Ensure 'db' is correctly initialized in your firebaseConfig.ts file
import { db } from '../config/firebaseConfig';
import {
  collection,        // Used to get a reference to a Firestore collection
  query,             // Used to build queries (e.g., ordering documents)
  orderBy,           // Used within queries to specify sort order
  onSnapshot,        // Listens for real-time updates to a query result
  addDoc,            // Adds a new document to a collection
  updateDoc,         // Updates an existing document
  deleteDoc,         // Deletes a document
  doc,               // Gets a reference to a specific document
  serverTimestamp,   // Generates a timestamp on the Firestore server
  Timestamp          // Firestore's native Timestamp type for date conversion
} from 'firebase/firestore';
import colors from '../globals/colors';


/**
 * TodoListScreen Component
 * Displays a list of tasks, allows adding, editing, deleting,
 * toggling completion status, and filtering/sorting tasks.
 * All task operations are synchronized with Firebase Firestore.
 */
const TodoListScreen: React.FC = () => {
  // --- State Variables ---
  const [tasks, setTasks] = useState<Task[]>([]); // Stores the list of tasks fetched from Firestore
  const [isModalVisible, setIsModalVisible] = useState(false); // Controls visibility of the Add/Edit Task Modal
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Stores the task being edited, null if adding new
  const [filter, setFilter] = useState<Filter>('Pending'); // Current filter ('All', 'Pending', 'Completed')
  const [sortBy, setSortBy] = useState<SortBy>('priority'); // Current sort criterion ('createdAt', 'dueDate', 'priority')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // Current sort order ('asc', 'desc')

  // --- Firestore Real-time Data Listener (useEffect) ---
  // This effect runs once on component mount to set up a real-time listener
  // to the 'tasks' collection in Firestore. It keeps the local 'tasks' state
  // synchronized with the database.
  useEffect(() => {

    const onBackPress = () => {
      // You can call a function here if you want to do something,
      // but if you want to do nothing, just return true.
      console.log('Android back button pressed, doing nothing.');
      // Alert.alert('Back Press', 'You pressed the back button!'); // Optional: for testing

      // Return true to prevent default back button behavior (e.g., navigating back)
      return true;
    };
    
    // Get a reference to the 'tasks' collection
    const tasksCollectionRef = collection(db, 'tasks');

    // Create a query to order tasks by their creation time in ascending order.
    // 'createdAt' is populated by serverTimestamp() when a task is added.
    const q = query(tasksCollectionRef, orderBy('createdAt', 'asc'));

    // Set up the real-time listener. 'onSnapshot' returns an unsubscribe function.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map Firestore documents to our local Task interface
      const fetchedTasks: Task[] = snapshot.docs.map(doc => {
        const data = doc.data(); // Get the document data
        return {
          id: doc.id, // Use Firestore's auto-generated document ID as our task ID
          title: data.title,
          completed: data.completed,
          // Convert Firestore Timestamp objects to JavaScript Date objects
          dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : undefined,
          priority: data.priority,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        };
      });

      // --- Local UI Reordering Logic ---
      // This logic ensures completed tasks always appear at the bottom of the list
      // for better user experience, while maintaining their creation order within their groups.
      const completed = fetchedTasks.filter((task) => task.completed);
      const pending = fetchedTasks.filter((task) => !task.completed);

      // Sort pending and completed tasks by creation date
      pending.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      completed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Update the state with the reordered tasks
      setTasks([...pending, ...completed]);
    }, (error) => {
      // Error handling for Firestore fetching issues (e.g., network, permissions)
      console.error("Error fetching tasks from Firestore: ", error);
      Alert.alert("Error", "Failed to load tasks from the cloud. Check your internet or Firebase rules.");
    });

    // Clean up the listener when the component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // --- Task Operations (Firebase Firestore Interactions) ---

  /**
   * Handles saving a new task or updating an existing one to Firestore.
   * @param task The task object to be saved/updated.
   */
  const handleSaveTask = async (task: Task) => {
    try {
      if (editingTask) {
        // If editingTask is set, update the existing document in Firestore
        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
          title: task.title,
          completed: task.completed, // Preserve current completion status
          dueDate: task.dueDate || null, // Store as null if no due date is set
          priority: task.priority,
          // 'createdAt' is not updated when editing
        });
      } else {
        // If not editing, add a new document to the 'tasks' collection
        await addDoc(collection(db, 'tasks'), {
          title: task.title,
          completed: false, // New tasks are always initialized as not completed
          dueDate: task.dueDate || null, // Store as null if no due date
          priority: task.priority,
          createdAt: serverTimestamp(), // Use server-generated timestamp for consistency
        });
      }
      setIsModalVisible(false); // Close the modal
      setEditingTask(null); // Clear the editing task state
    } catch (error) {
      console.error('Error saving task to Firestore:', error);
      Alert.alert('Error', 'Failed to save task to the cloud.');
    }
  };

  /**
   * Toggles the completion status of a task in Firestore.
   * @param id The Firestore document ID of the task to toggle.
   */
  const handleToggleComplete = useCallback(async (id: string) => {
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      if (taskToToggle) {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
          completed: !taskToToggle.completed, // Toggle the boolean status
        });
        // The onSnapshot listener will automatically update the local 'tasks' state,
        // so no manual state update is needed here.
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task status.');
    }
  }, [tasks]); // 'tasks' is a dependency to ensure we get the latest task status

  /**
   * Prompts the user for confirmation and then deletes a task from Firestore.
   * @param id The Firestore document ID of the task to delete.
   */
  const handleDeleteTask = useCallback((id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tasks', id)); // Delete the document from Firestore
              // State update is handled by the onSnapshot listener.
            } catch (error) {
              console.error('Error deleting task from Firestore:', error);
              Alert.alert('Error', 'Failed to delete task.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, []); // No dependencies as it operates on a given ID

  /**
   * Sets the task to be edited and opens the modal.
   * @param task The task object to pre-populate the modal with.
   */
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  }, []);


  // --- Filtering and Sorting Logic (Applied Locally to fetched tasks) ---

  /**
   * Applies the current filter ('All', 'Pending', 'Completed') to the tasks list.
   * @returns An array of filtered tasks.
   */
  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;
    if (filter === 'Pending') {
      filtered = tasks.filter((task) => !task.completed);
    } else if (filter === 'Completed') {
      filtered = tasks.filter((task) => task.completed);
    }
    return filtered;
  }, [tasks, filter]); // Re-run if tasks or filter changes

  /**
   * Applies the current sort order ('asc', 'desc') and criterion
   * ('createdAt', 'dueDate', 'priority') to the filtered tasks.
   * @param filteredTasks The array of tasks after filtering.
   * @returns An array of sorted tasks.
   */
  const getSortedTasks = useCallback(
    (filteredTasks: Task[]) => {
      const sorted = [...filteredTasks].sort((a, b) => {
        let compareValue = 0;
        if (sortBy === 'createdAt') {
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
        } else if (sortBy === 'dueDate') {
          // Undefined due dates are treated as 'Infinity' to sort them at the end
          const dateA = a.dueDate ? a.dueDate.getTime() : Infinity;
          const dateB = b.dueDate ? b.dueDate.getTime() : Infinity;
          compareValue = dateA - dateB;
        } else if (sortBy === 'priority') {
          // Map priority strings to numerical values for comparison
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          compareValue = priorityOrder[b.priority] - priorityOrder[a.priority]; // High comes first by default
        }

        // Apply ascending or descending order
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
      return sorted;
    },
    [sortBy, sortOrder] // Re-run if sort criterion or order changes
  );

  // Combine filtering and sorting to get the tasks currently displayed
  const displayedTasks = getSortedTasks(getFilteredTasks());


  
  // --- Component JSX ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar configuration */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      {/* Filter and Sort Options Component */}
      <FilterSortOptions
        currentFilter={filter}
        onSelectFilter={setFilter}
        currentSortBy={sortBy}
        onSelectSortBy={setSortBy}
        currentSortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      />

      {/* FlatList to display tasks */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggleComplete={handleToggleComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        // Component to show when the list is empty
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No tasks yet! Add one to get started.</Text>
            <Icon name="event-note" size={50} color="#ccc" style={styles.emptyListIcon} />
          </View>
        }
        contentContainerStyle={styles.listContentContainer}
      />

      {/* Footer buttons for Add Task */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingTask(null); // Clear any editing state for new task
            setIsModalVisible(true); // Open the Add/Edit modal
          }}
        >
          <Icon name="add" size={30} color="#FFF" />
          {/* <Text style={styles.addButtonText}>Add Task</Text> */}
        </TouchableOpacity>
      </View>

      {/* Modal for adding or editing tasks */}
      <AddEditTaskModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </SafeAreaView>
  );
};

// --- StyleSheet for component styling ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightOrange,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100, // Provides space so footer buttons don't cover list items
  },
  emptyListContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
  },
  emptyListText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyListIcon: {
    marginTop: 10,
  },
  footerButtons: {
    position: 'absolute',
    borderRadius: 400,
    bottom: 45,
    left: 0,
    right: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  addButton: {
    backgroundColor: '#007AFF', // Standard iOS blue
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TodoListScreen;