/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import {
  addActionReceptor,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { MusicNote, MusicOff } from '@mui/icons-material'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useShelfStyles } from '../../../components/Shelves/useShelfStyles'
import { AuthService } from '../../services/AuthService'
import { AuthState } from '../../services/AuthService'
import { AvatarService } from '../../services/AvatarService'
import styles from './index.module.scss'
import { PopupMenuServiceReceptor, PopupMenuServices, PopupMenuState } from './PopupMenuService'

const audioInstance = new Audio(
  ''
)

// Function to decode JWT token and retrieve information
const decodeJWTToken = (token) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}

export const UserMenu = () => {
  const popupMenuState = useHookstate(getMutableState(PopupMenuState))
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenu.openMenu ? popupMenu.menus[popupMenu.openMenu] : null
  const hotbarItems = popupMenu.hotbar
  const [audioState, setAudioState] = React.useState(false)
  const [audiIcon, setAudioIcon] = React.useState(<MusicNote />)
  const authState = useHookstate(getMutableState(AuthState))
  const [myUserEntity, setMyUserEntity]: any = useState()

  let itemClick
  const ringtoneStart = () => {
    if (audioState) {
      audioInstance.pause()
      setAudioState(false)
      setAudioIcon(<MusicNote />)
    } else {
      audioInstance.currentTime = 0
      audioInstance.loop = true
      audioInstance.play()
      setAudioState(true)
      setAudioIcon(<MusicOff />)
    }
  }

  useEffect(() => {
    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  const { bottomShelfStyle } = useShelfStyles()

  // Codes to fetch personal information from Datalocker
  useEffect(() => {
    const handleFetchNickName = (attribution_value: string, key_name: string) => {

      const config = {
        method: 'POST',
        url: `${process.env.VITE_KEYCLOAK_API_SERVER_URL} ${pdl_access_token}&url=${process.env.VITE_KEYCLOAK_API_ENDPOINT}&isLogout=false`,
        data: data
      }
      const userId = Engine.instance.userId
      axios(config)
        .then(function (response) {
          console.log('Response Data From PDL info', response.data.value)
          const userFullName = response.data.value ? response.data.value?.trim() : 'No Nickname'
          AuthService.updateUsername(userId, userFullName)
          localStorage.setItem('pdl_username_updated', 'true')
          localStorage.setItem(key_name, userFullName)
        })
        .catch(function (error) {
          console.log('Error fetching the personal info from PDL', error)
        })
    }
    if (localStorage.getItem('pdl_access_token') && localStorage.getItem('pdl_username_updated') === 'false') {
      handleFetchNickName('user_nickname', 'username')
      // handleFetchNickName("user_status", "username")
    }
  }, [])

  const allAvatarList = async () => {
    return await AvatarService.newFetchAvatarList3()
  }

  const updateAvatar = async (user) => {
    return await AvatarService.updateUserAvatarId(Engine.instance.userId, user?.id)
  }

  // Function to check if the entity exists and fetch the entity
  let tempEntity
  const getMyEntityId = () => {
    tempEntity = UUIDComponent.entitiesByUUID[Engine.instance.userId]

    if (!tempEntity) {
      setTimeout(() => {
        getMyEntityId()
      }, 1000)
    } else {
      setMyUserEntity(tempEntity)
    }
  }

  useEffect(() => {
    getMyEntityId()
  }, [])

  // Function to generate random number between 0 and 1
  const getRandomNumber: any = () => Math.floor(Math.random() * (2 - 0) + 0)

  useEffect(() => {
    let selectedAvatar
    if (myUserEntity) {
      const fetchAllAvatar = allAvatarList
      fetchAllAvatar().then((data) => {
        if (localStorage.getItem('keycloakUser')) {
          if (localStorage.getItem('ComfirmSelected') !== 'true') {
            selectedAvatar = data?.find((avatar) => avatar.name === '')
          } else {
            selectedAvatar = data?.find((avatar) => avatar.name === localStorage.getItem('AvatarName'))
          }
          localStorage.setItem('AvatarName', selectedAvatar.name)
        } else {
          selectedAvatar = data[getRandomNumber()]
        }

        const updateUser = updateAvatar(selectedAvatar)

        updateUser.then(() => {
          itemClick = document.querySelector('.custom-0')
          if (!localStorage.getItem('keycloakUser')) {
            itemClick?.click()
          } else {
            authState.user.isGuest.set(false)
          }
        })
      })
    }
  }, [myUserEntity])

  return (
    <div>
      <ClickAwayListener onClickAway={() => PopupMenuServices.showPopupMenu()} mouseEvent="onMouseDown">
        <>
          <section
            className={`${styles.hotbarContainer} ${bottomShelfStyle} ${
              popupMenuState.openMenu.value ? styles.fadeOutBottom : ''
            }`}
          >
            <div className={styles.buttonsContainer}>
              {Object.keys(hotbarItems).map((id, index) => {
                const IconNode = hotbarItems[id]
                if (!IconNode) return null
                if (index !== 1 && index !== 3) {
                  return (
                    <IconButton
                      key={index}
                      type="solid"
                      classId={`custom-${index}`}
                      icon={<IconNode />}
                      sizePx={50}
                      onClick={() => PopupMenuServices.showPopupMenu(id)}
                      sx={{
                        cursor: 'pointer',
                        background: 'var(--iconButtonBackground)'
                      }}
                    />
                  )
                }
              })}
              {/* <IconButton
                key={5}
                type="solid"
                icon={audiIcon}
                sizePx={50}
                onClick={ringtoneStart}
                sx={{
                  cursor: 'pointer',
                  background: 'var(--iconButtonBackground)'
                }}
              /> */}
            </div>
          </section>
          {Panel && <Panel {...popupMenu.params} />}
        </>
      </ClickAwayListener>
    </div>
  )
}
