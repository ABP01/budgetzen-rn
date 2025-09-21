import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'

const welcome = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TouchableOpacity>
            <Typo></Typo>
        </TouchableOpacity>
        </View>
    </ScreenWrapper>
  )
}

export default welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: spacingY._7,
    },
    welcomeImage: {
        width: '100%',
        height: verticalScale(300),
        alignSelf: 'center',
        marginTop: verticalScale(100),
    },
    loginButton: {
        alignSelf: 'flex-end',
        marginRight: spacingY._20,
    },
    footer: {
        alignItems: 'center',
        backgroundColor: 'colors.neutral900',
        paddingTop: verticalScale(30),
        paddingBottom: verticalScale(45),
        gap: spacingY._20,
        shadowColor: 'white',
        shadowOffset: { width: 0, height: -10 },
        elevation: 10,
        shadowOpacity: 0.15,
        shadowRadius: 25,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: spacingX._25,
    },

})