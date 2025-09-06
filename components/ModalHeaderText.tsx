import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const ModalHeaderText = () => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
      <TouchableOpacity>
        <Text
            style={{
                fontFamily: 'inter-sb',
                fontSize: 18,
                
            }}
        >Filtros</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ModalHeaderText