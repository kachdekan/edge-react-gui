// @flow
import { type EdgeCurrencyWallet } from 'edge-core-js'
import * as React from 'react'

import { formatFiatString } from '../../hooks/useFiatText.js'
import { getDenomFromIsoCode } from '../../util/utils.js'
import { type Theme, cacheStyles, useTheme } from '../services/ThemeContext.js'
import { FiatText } from '../text/FiatText'
import { EdgeText } from '../themed/EdgeText'
import { Tile } from './Tile.js'

// Either Fiat OR Crypto amount props must be provided.
type Props = {
  title: string,

  // Fiat amount props
  fiatAmount?: string,

  // Crypto amount props
  nativeCryptoAmount?: string,
  tokenId?: string,
  wallet: EdgeCurrencyWallet
}

export const FiatAmountTile = (props: Props) => {
  const { fiatAmount, nativeCryptoAmount, title, tokenId, wallet } = props
  if (fiatAmount == null && nativeCryptoAmount == null) throw new Error('Either fiat or crypto amount must be given to FiatAmountTile')

  const theme = useTheme()
  const styles = getStyles(theme)

  const amountValue =
    fiatAmount != null ? (
      `${getDenomFromIsoCode(wallet.fiatCurrencyCode).symbol ?? ''}${formatFiatString({ fiatAmount })}`
    ) : nativeCryptoAmount != null ? (
      <FiatText tokenId={tokenId} nativeCryptoAmount={nativeCryptoAmount} wallet={wallet} />
    ) : null

  return (
    <Tile type="static" title={title} contentPadding={false} style={styles.tileContainer}>
      <EdgeText>{amountValue}</EdgeText>
    </Tile>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  tileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  }
}))
