import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ThreeCheckboxes = ({ list = [''], onPress = (index: number) => {} }) => {
  const [selected, setSelected] = useState(0); // Track the selected checkbox

  const handlePress = (index: number) => {
    setSelected(index); // Update the selected index
    onPress(index)
  };

  return (
    <View style={styles.container}>
      {list.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.checkboxContainer}
          onPress={() => handlePress(index)}
        >
          <View style={[styles.checkbox, selected === index && styles.checked]} />
          <Text style={styles.label}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 16,
  },
});

export default ThreeCheckboxes;
