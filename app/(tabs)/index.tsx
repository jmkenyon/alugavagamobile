import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const page = () => {
  return (
    <View>
      <Link href={"/(modals)/login"}>Entrar</Link>
      <Link href={"/(modals)/booking"}>Reservar</Link>
      <Link href={"/anuncio/1897"}>Detalhes da Vaga</Link>
    </View>
  )
}

export default page