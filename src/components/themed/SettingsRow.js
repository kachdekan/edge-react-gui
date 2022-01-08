// @flow

import * as React from 'react'

import { usePendingPress } from '../../hooks/usePendingPress.js'
import { ActivityIndicator, Text, TouchableHighlight } from '../../types/wrappedReactNative.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'

type OwnProps = {
  children?: React.Node,

  // Show with a dim style when set. Defaults to false:
  disabled?: boolean,

  // Insert a text label after the other children when set:
  label?: string,

  // An interactive control to render on the right:
  right?: React.Node,

  // Called when the user presses the row.
  // If the callback returns a promise, the row will disable itself
  // and show a spinner until the promise resolves.
  onPress?: () => void | Promise<void>
}

type Props = OwnProps & ThemeProps

/**
 * A settings row places an interactive control next to a description,
 * which can be some combination of React children and a plain text label.
 */
function SettingsRowComponent(props: Props): React$Element<any> {
  const { children, disabled = false, label = '', theme, right, onPress } = props
  const styles = getStyles(theme)

  const [pending, handlePress] = usePendingPress(onPress)

  return (
    <TouchableHighlight underlayColor={theme.settingsRowPressed} style={styles.row} onPress={handlePress}>
      <>
        {children}
        {<Text style={disabled ? styles.disabledText : styles.text}>{label}</Text>}
        {pending ? <ActivityIndicator color={theme.iconTappable} style={styles.spinner} /> : right}
      </>
    </TouchableHighlight>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  const commonText = {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1),
    textAlign: 'left',
    paddingHorizontal: theme.rem(0.5)
  }

  return {
    row: {
      alignItems: 'center',
      backgroundColor: theme.settingsRowBackground,
      flexDirection: 'row',
      marginBottom: theme.rem(1 / 16),
      minHeight: theme.rem(3),
      padding: theme.rem(0.5)
    },
    text: {
      ...commonText,
      color: theme.primaryText
    },
    disabledText: {
      ...commonText,
      color: theme.deactivatedText
    },
    spinner: {
      height: theme.rem(1.5),
      marginHorizontal: theme.rem(0.5)
    }
  }
})

export const SettingsRow: React.StatelessFunctionalComponent<$Exact<OwnProps>> = withTheme(SettingsRowComponent)
