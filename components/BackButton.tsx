import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { BackButtonProps } from '@/types'
import { useRouter } from 'expo-router'
import { LIcon, icons } from '@/constants/icons'
import { verticalScale } from '@/utils/styling'
import { colors, radius } from '@/constants/theme'

const BackButton = ({
    style,
    iconSize = 26,
}: BackButtonProps) => {
    const router = useRouter()
  return (
    <TouchableOpacity onPress={() => router.back()} style={[styles.button, style]}>
      <LIcon icon={icons.chevronLeft} size={verticalScale(iconSize)} color={colors.white} />
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        alignSelf: "flex-start",
        borderRadius: radius._12,
        borderCurve: "continuous",
        padding: 6,
    },
})