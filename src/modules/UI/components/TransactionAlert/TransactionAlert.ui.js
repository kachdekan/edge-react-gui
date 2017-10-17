// @flow

import React, {Component} from 'react'
import {Text} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import {sprintf} from 'sprintf-js'

import DropdownAlert from '../DropdownAlert/DropdownAlert.ui'
import {AlertContainer, AlertHeader, AlertBody} from '../DropdownAlert/components'
import styles from './styles'
import strings from '../../../../locales/default'

export type Props = {
  message: string,
  displayAlert: boolean,
  displayName: string,
  displayAmount: string,
  displaySymbol: string,
  dismissAlert: Function,
}

export default class TransactionAlert extends Component<Props> {
  checkmarkIcon = <Icon style={styles.checkmarkIcon} name={'ios-checkmark-circle'} />
  message = () => {
    const {displayAmount, displayName, displaySymbol} = this.props
    // const amountFiat = metadata
    //   ? metadata.amountFiat
    //   : undefined
    // const {
    //   fiatCurrencyCode
    // } = wallet
    const message = sprintf(strings.enUS['bitcoin_received'], `${displaySymbol || displayName} ${displayAmount}`)

    return message
  }

  render () {
    const {displayAlert, dismissAlert} = this.props

    return <DropdownAlert visible={displayAlert} onClose={dismissAlert}>
      <AlertContainer style={styles.alertContainer}>

        <AlertHeader style={styles.alertHeader}>
          {this.checkmarkIcon}
        </AlertHeader>

        <AlertBody>
          <Text style={styles.alertHeaderText}>
            {this.message()}
          </Text>
        </AlertBody>

      </AlertContainer>
    </DropdownAlert>
  }
}
