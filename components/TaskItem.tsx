import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Task } from '../globals';
import Icon from 'react-native-vector-icons/MaterialIcons'; // You might need to install react-native-vector-icons
import Colors from '../globals/Colors';


interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return '#FF6B6B'; // Red
      case 'Medium':
        return '#FFD166'; // Yellow/Orange
      case 'Low':
        return '#6FCF97'; // Green
      default:
        return '#CCCCCC';
    }
  };

  return (
    <View style={[styles.container, task.completed && styles.completedContainer]}>
      {/* <TouchableOpacity onPress={() => onToggleComplete(task.id)} style={styles.checkboxContainer}> */}
        <Switch
          value={task.completed}
          onValueChange={() => onToggleComplete(task.id)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={task.completed ? '#f5dd4b' : '#f4f3f4'}
        />
      {/* </TouchableOpacity> */}

      <View style={styles.detailsContainer}>
        <Text
          style={[
            styles.title,
            task.completed && styles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        {task.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onEditTask(task)} style={styles.actionButton}>
          <Icon name="edit" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteTask(task.id)} style={styles.actionButton}>
          <Icon name="delete" size={24} color="#D85151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: '#F0F0F0',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  dueDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  priorityBadge: {
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default TaskItem;