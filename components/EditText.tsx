import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const EditText = ({ placeholder = '', value = '', onChangeText = (text: string) => {}, editable = true }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
  },
});

export default EditText;
