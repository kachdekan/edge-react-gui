// @flow

import { wrap } from 'cavy'
import * as React from 'react'
import { cacheStyles } from 'react-native-patina'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { Text, TouchableOpacity } from '../../types/wrappedReactNative.js'
import { unpackEdges } from '../../util/edges'
import { type Theme, useTheme } from '../services/ThemeContext.js'

const ModalTitleComponent = (props: { children: React.Node, center?: boolean, paddingRem?: number[] | number }) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return <Text style={[styles.titleText, props.center ? styles.titleCenter : null, paddingStyles(props.paddingRem, theme)]}>{props.children}</Text>
}

const ModalMessageComponent = (props: { children: React.Node, paddingRem?: number[] | number, isWarning?: boolean }) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return <Text style={[styles.messageText, paddingStyles(props.paddingRem, theme), props.isWarning && styles.warningText]}>{props.children}</Text>
}

const ModalCloseArrowComponent = (props: { onPress: () => void }) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <TouchableOpacity onPress={props.onPress} style={styles.closeArrow}>
      <FontAwesome5 name="chevron-down" size={theme.rem(1.25)} color={theme.iconTappable} />
    </TouchableOpacity>
  )
}

function paddingStyles(paddingRem?: number[] | number, theme: Theme) {
  const padding = unpackEdges(paddingRem == null ? 0 : paddingRem)

  return {
    paddingBottom: theme.rem(padding.bottom),
    paddingLeft: theme.rem(padding.left),
    paddingRight: theme.rem(padding.right),
    paddingTop: theme.rem(padding.top)
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  closeArrow: {
    alignItems: 'center',
    paddingTop: theme.rem(1)
  },
  titleText: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceMedium,
    fontSize: theme.rem(1.2),
    margin: theme.rem(0.5)
  },
  titleCenter: {
    textAlign: 'center'
  },
  warningText: {
    color: theme.warningText
  },
  messageText: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1),
    margin: theme.rem(0.5),
    textAlign: 'left'
  }
}))

export const ModalTitle = wrap(ModalTitleComponent)
export const ModalMessage = wrap(ModalMessageComponent)
export const ModalCloseArrow = wrap(ModalCloseArrowComponent)
