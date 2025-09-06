import Colors from '@/constants/Colors';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type CheckBoxProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
  size?: number; // optional size
  color?: string; // optional selected color
};

const CheckBox: React.FC<CheckBoxProps> = ({
  label,
  checked,
  onPress,
  size = 24,
  color = Colors.primary,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderColor: color,
            backgroundColor: checked ? color : '#fff',
          },
        ]}
      >
        {checked && <View style={[styles.innerBox, { width: size / 2, height: size / 2 }]} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  box: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBox: {
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
});

export default CheckBox;