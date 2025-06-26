// TaskItem.tsx
'use strict';

import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import { Task } from '../globals';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../globals/colors';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo((props) => {
  // Destructure props inside the component body, on a new line
  const { task, onToggleComplete, onEditTask, onDeleteTask } = props;

  const getPriorityColor = useCallback((priority: Task['priority']): string => {
    switch (priority) {
      case 'Urgent':
        return colors.priorityUrgent;
      case 'Critical':
        return colors.priorityCritical;
      case 'High':
        return colors.priorityHigh;
      case 'Medium':
        return colors.priorityMedium;
      case 'Low':
        return colors.priorityLow;
      default:
        return colors.priorityDefault;
    }
  }, []);

  return (
    <View style={[localStyles.container, task.completed && localStyles.completedContainer]}>
      <Switch
        value={task.completed}
        onValueChange={() => onToggleComplete(task.id)}
        trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
        thumbColor={task.completed ? colors.switchThumbCompleted : colors.switchThumbDefault}
      />

      <View style={localStyles.detailsContainer}>
        <Text
          style={[
            localStyles.title,
            task.completed && localStyles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        {task.dueDate && (
          <Text style={localStyles.dueDate}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
        <View style={[localStyles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={localStyles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      <View style={localStyles.actionsContainer}>
        <TouchableOpacity onPress={() => onEditTask(task)} style={localStyles.actionButton}>
          <Icon name="edit" size={24} color={colors.mediumGray} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteTask(task.id)} style={localStyles.actionButton}>
          <Icon name="delete" size={24} color={colors.deleteRed} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mediumOrange,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: colors.completedBackground,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.completedText,
  },
  dueDate: {
    fontSize: 10,
    color: colors.darkGray,
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
    color: colors.white,
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