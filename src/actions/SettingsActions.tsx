import { EdgeAccount, EdgeDenomination, EdgeSwapPluginType } from 'edge-core-js'
import { disableTouchId, enableTouchId } from 'edge-login-ui-rn'
import * as React from 'react'
import { openSettings, PermissionStatus, request } from 'react-native-permissions'
import { sprintf } from 'sprintf-js'

import { ButtonsModal } from '../components/modals/ButtonsModal'
import { Airship, showError } from '../components/services/AirshipInstance'
import { lstrings } from '../locales/strings'
import {
  setAutoLogoutTimeInSecondsRequest as setAutoLogoutTimeInSecondsRequestAccountSettings,
  setContactsPermissionOn as setContactsPermissionOnAccountSettings,
  setDefaultFiatRequest as setDefaultFiatRequestAccountSettings,
  setDenominationKeyRequest as setDenominationKeyRequestAccountSettings,
  setDeveloperModeOn as setDeveloperModeOnAccountSettings,
  setPreferredSwapPluginId as setPreferredSwapPluginIdAccountSettings,
  setPreferredSwapPluginType as setPreferredSwapPluginTypeAccountSettings,
  setSpamFilterOn as setSpamFilterOnAccountSettings,
  setSpendingLimits as setSpendingLimitsAccountSettings
} from '../modules/Core/Account/settings'
import { permissionNames } from '../reducers/PermissionsReducer'
import { convertCurrency } from '../selectors/WalletSelectors'
import { config } from '../theme/appConfig'
import { ThunkAction } from '../types/reduxTypes'
import { NavigationBase } from '../types/routerTypes'
import { logActivity } from '../util/logger'
import { DECIMAL_PRECISION } from '../util/utils'
import { validatePassword } from './AccountActions'
import { updateExchangeRates } from './ExchangeRateActions'
import { registerNotificationsV2 } from './NotificationActions'

export function updateOneSetting(setting: object): ThunkAction<void> {
  return (dispatch, getState) => {
    const state = getState()
    const settings = state.ui.settings
    const updatedSettings = {
      ...settings,
      ...setting
    }
    dispatch({
      type: 'UI/SETTINGS/UPDATE_SETTINGS',
      data: { settings: updatedSettings }
    })
  }
}

export function setAutoLogoutTimeInSecondsRequest(autoLogoutTimeInSeconds: number): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    await setAutoLogoutTimeInSecondsRequestAccountSettings(account, autoLogoutTimeInSeconds)
    dispatch({
      type: 'UI/SETTINGS/SET_AUTO_LOGOUT_TIME',
      data: { autoLogoutTimeInSeconds }
    })
  }
}

export function setDefaultFiatRequest(defaultFiat: string): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core

    // PSEUDO_CODE
    // get spendingLimits
    const spendingLimits = state.ui.settings.spendingLimits
    const { transaction } = spendingLimits
    const previousDefaultIsoFiat = state.ui.settings.defaultIsoFiat

    // update default fiat in account settings
    await setDefaultFiatRequestAccountSettings(account, defaultFiat)

    // update default fiat in settings
    dispatch({
      type: 'UI/SETTINGS/SET_DEFAULT_FIAT',
      data: { defaultFiat }
    })
    const nextDefaultIsoFiat = getState().ui.settings.defaultIsoFiat
    // convert from previous fiat to next fiat
    const fiatString = convertCurrency(state, previousDefaultIsoFiat, nextDefaultIsoFiat, transaction.amount.toFixed(DECIMAL_PRECISION))
    const transactionAmount = parseFloat(fiatString)
    const nextSpendingLimits = {
      transaction: {
        ...transaction,
        amount: parseFloat(transactionAmount.toFixed(2))
      }
    }

    // update spending limits in account settings
    await setSpendingLimitsAccountSettings(account, nextSpendingLimits)
    // update spending limits in settings
    dispatch({
      type: 'SPENDING_LIMITS/NEW_SPENDING_LIMITS',
      data: { spendingLimits: nextSpendingLimits }
    })
    await dispatch(updateExchangeRates())
    // Update push notifications
    await dispatch(registerNotificationsV2(true))
  }
}

export function setPreferredSwapPluginId(pluginId: string | undefined): ThunkAction<void> {
  return (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    setPreferredSwapPluginIdAccountSettings(account, pluginId)
      .then(() => {
        dispatch({
          type: 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN',
          data: pluginId
        })
        dispatch({
          type: 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN_TYPE',
          data: undefined
        })
      })
      .catch(showError)
  }
}

export function setPreferredSwapPluginType(swapPluginType: EdgeSwapPluginType | undefined): ThunkAction<void> {
  return (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    setPreferredSwapPluginTypeAccountSettings(account, swapPluginType)
      .then(() => {
        dispatch({
          type: 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN_TYPE',
          data: swapPluginType
        })
        dispatch({
          type: 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN',
          data: undefined
        })
      })
      .catch(showError)
  }
}

// Denominations
export function setDenominationKeyRequest(pluginId: string, currencyCode: string, denomination: EdgeDenomination): ThunkAction<Promise<unknown>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core

    return await setDenominationKeyRequestAccountSettings(account, pluginId, currencyCode, denomination)
      .then(() =>
        dispatch({
          type: 'UI/SETTINGS/SET_DENOMINATION_KEY',
          data: { pluginId, currencyCode, denomination }
        })
      )
      .catch(showError)
  }
}

// touch id interaction
export function updateTouchIdEnabled(isTouchEnabled: boolean, account: EdgeAccount): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    // dispatch the update for the new state for
    dispatch({
      type: 'UI/SETTINGS/CHANGE_TOUCH_ID_SETTINGS',
      data: { isTouchEnabled }
    })
    if (isTouchEnabled) {
      await enableTouchId(account)
    } else {
      await disableTouchId(account)
    }
  }
}

export function togglePinLoginEnabled(pinLoginEnabled: boolean): ThunkAction<Promise<unknown>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { context, account } = state.core

    dispatch({
      type: 'UI/SETTINGS/TOGGLE_PIN_LOGIN_ENABLED',
      data: { pinLoginEnabled }
    })
    return await account.changePin({ enableLogin: pinLoginEnabled }).catch(async error => {
      showError(error)

      let pinLoginEnabled = false
      for (const userInfo of context.localUsers) {
        if (userInfo.loginId === account.rootLoginId && userInfo.pinLoginEnabled) {
          pinLoginEnabled = true
        }
      }

      dispatch({
        type: 'UI/SETTINGS/TOGGLE_PIN_LOGIN_ENABLED',
        data: { pinLoginEnabled }
      })
    })
  }
}

export function showReEnableOtpModal(): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    const otpResetDate = account.otpResetDate
    if (!otpResetDate) return

    const resolveValue = await Airship.show<'confirm' | 'cancel' | undefined>(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.title_otp_keep_modal}
        message={lstrings.otp_modal_reset_description}
        buttons={{
          confirm: { label: lstrings.otp_keep },
          cancel: { label: lstrings.otp_disable }
        }}
      />
    ))

    if (resolveValue === 'confirm') {
      // true on positive, false on negative
      // let 2FA expire
      await account.cancelOtpReset()
    } else {
      await account.disableOtp()
    } // if default of null (press backdrop) do not change anything and keep reminding
  }
}

export function showUnlockSettingsModal(): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const passwordValid = await dispatch(validatePassword())
    if (passwordValid) {
      dispatch({
        type: 'UI/SETTINGS/SET_SETTINGS_LOCK',
        data: false
      })
    }
  }
}

export function showRestoreWalletsModal(navigation: NavigationBase): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    const response = await Airship.show<'confirm' | 'cancel' | undefined>(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.restore_wallets_modal_title}
        message={lstrings.restore_wallets_modal_description}
        buttons={{
          confirm: { label: lstrings.restore_wallets_modal_confirm },
          cancel: { label: lstrings.restore_wallets_modal_cancel }
        }}
      />
    ))
    if (response === 'confirm') {
      const restoreKeys = account.allKeys.filter(key => key.archived || key.deleted)
      await Promise.all(
        restoreKeys
          .map(key => key.id)
          .map(
            async walletId =>
              await account.changeWalletStates({
                [walletId]: { archived: false, deleted: false }
              })
          )
      )
      logActivity(`Restore Wallets: ${account.username}`)

      navigation.navigate('walletsTab', { screen: 'walletList' })
    }
  }
}

export function setDeveloperModeOn(developerModeOn: boolean): ThunkAction<void> {
  return (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    setDeveloperModeOnAccountSettings(account, developerModeOn)
      .then(() => {
        if (developerModeOn) {
          dispatch({ type: 'DEVELOPER_MODE_ON' })
          return
        }
        dispatch({ type: 'DEVELOPER_MODE_OFF' })
      })
      .catch(showError)
  }
}

export function setSpamFilterOn(spamFilterOn: boolean): ThunkAction<void> {
  return (dispatch, getState) => {
    const state = getState()
    const { account } = state.core
    setSpamFilterOnAccountSettings(account, spamFilterOn)
      .then(() => {
        if (spamFilterOn) {
          dispatch({ type: 'SPAM_FILTER_ON' })
          return
        }
        dispatch({ type: 'SPAM_FILTER_OFF' })
      })
      .catch(showError)
  }
}

/**
 * Toggle the 'Contacts Access' Edge setting. Will request permissions if
 * toggled on/enabled AND system-level contacts permissions are not granted.
 * Does NOT modify system-level contacts permissions if toggling the 'Contacts
 * Access' setting OFF
 */
export function setContactsPermissionOn(contactsPermissionOn: boolean): ThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState()
    const { account } = state.core

    await setContactsPermissionOnAccountSettings(account, contactsPermissionOn)

    if (contactsPermissionOn) {
      // Initial prompt to inform the reason of the permissions request.
      // Denying this prompt will cause permissionStatus to be 'blocked',
      // regardless of the prior permissions state.
      await request(permissionNames.contacts, {
        title: lstrings.contacts_permission_modal_title,
        message: sprintf(lstrings.contacts_permission_modal_body_1, config.appName),
        buttonPositive: lstrings.string_allow,
        buttonNegative: lstrings.string_deny
      })
        .then(async (permissionStatus: PermissionStatus) => {
          // Can't request permission from within the app if previously blocked
          if (permissionStatus === 'blocked') await openSettings()
        })
        // Handle any other potential failure in enabling the permission
        // progmatically from within Edge by redirecting to the system settings
        // instead. Any manual change in system settings causes an app restart.
        .catch(async _e => await openSettings())
    }

    dispatch({ type: 'UI/SETTINGS/SET_CONTACTS_PERMISSION', data: { contactsPermissionOn } })
  }
}
