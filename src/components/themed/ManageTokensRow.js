// @flow

import { wrap } from 'cavy'
import type { EdgeMetaToken } from 'edge-core-js'
import * as React from 'react'
import FastImage from 'react-native-fast-image'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

import { SYNCED_ACCOUNT_DEFAULTS } from '../../modules/Core/Account/settings.js'
import { Switch, View } from '../../types/wrappedReactNative.js'
import { noOp } from '../../util/utils.js'
import { type Theme, cacheStyles, useTheme } from '../services/ThemeContext.js'
import { WalletListRow } from './WalletListRow'

export type Props = {
  toggleToken: string => void,
  metaToken: EdgeMetaToken & {
    item: any
  },
  enabledList: string[],
  goToEditTokenScene: string => void,
  symbolImage: string
}

const ManageTokensRowComponent = (props: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  const { currencyCode, currencyName } = props.metaToken.item
  const { enabledList, toggleToken, goToEditTokenScene, symbolImage } = props

  const Icon = () => (
    <View style={styles.iconContainer}>
      <FastImage style={styles.iconSize} source={{ uri: symbolImage }} />
    </View>
  )

  const EditIcon = () => (isEditable ? <FontAwesomeIcon name="edit" size={theme.rem(0.95)} color={theme.iconTappable} /> : null)

  const enabled = enabledList.indexOf(currencyCode) >= 0
  // disable editing if token is native to the app
  const isEditable = !Object.keys(SYNCED_ACCOUNT_DEFAULTS).includes(currencyCode)

  const onPress = () => {
    isEditable ? goToEditTokenScene(currencyCode) : noOp()
  }

  return (
    <WalletListRow onPress={onPress} gradient icon={<Icon />} editIcon={<EditIcon />} currencyCode={currencyCode} walletName={currencyName}>
      <View style={styles.touchableCheckboxInterior}>
        <Switch
          onChange={() => toggleToken(currencyCode)}
          value={enabled}
          ios_backgroundColor={theme.toggleButtonOff}
          trackColor={{
            false: theme.toggleButtonOff,
            true: theme.toggleButton
          }}
        />
      </View>
    </WalletListRow>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconSize: {
    width: theme.rem(2),
    height: theme.rem(2)
  },
  touchableCheckboxInterior: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkBox: {
    alignSelf: 'center'
  }
}))

export const ManageTokensRow = wrap(ManageTokensRowComponent)
