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

import React, { useEffect, useState } from 'react'
import { Mesh } from 'three'

import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { changeAvatarAnimationState } from '@etherealengine/engine/src/avatar/animation/AvatarAnimationGraph'
import { AvatarStates } from '@etherealengine/engine/src/avatar/animation/Util'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import ClickAwayListener from '@mui/material/ClickAwayListener'

import { PopupMenuServices } from '../PopupMenuService'
import styles from './EmoteMenu.module.scss'

const MAX_EMOTE_PER_PAGE = 6
const MIN_EMOTE_PER_PAGE = 5
const getEmotePerPage = () => (window.innerWidth > 768 ? MAX_EMOTE_PER_PAGE : MIN_EMOTE_PER_PAGE)

export const useEmoteMenuHooks = () => {
  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getEmotePerPage())

  let [menuRadius, setMenuRadius] = useState(window.innerWidth > 360 ? 182 : 150)

  let menuPadding = window.innerWidth > 360 ? 25 : 20
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  //Facial expression code starts
  const changeTexture = async (texture: string) => {
    const entity = Engine.instance.localClientEntity
    const avatar = getComponent(entity, AvatarComponent)
    const hier = avatar.model?.children[0].children[0].children[0].children.find((child) => child.name === 'head')
    if (hier !== undefined) {
      const id = hier?.uuid
      const mesh = hier as Mesh
      const preMap = mesh.material.map
      const prop = await AssetLoader.loadAsync(texture)
      EditorControlFunctions.modifyMaterial([id], mesh.material.uuid, [{ ['map']: prop }])
    }
  }
  //Facial expression code ends

  let [items, setItems] = useState([
    {
      body: <img src="/static/Wave.svg" alt="Wave" />,
      containerProps: {
        onClick: () => {
          changeTexture(`${process.env.VITE_FILE_SERVER}/projects/default-project/assets/SGT_diffse_kirakira_2.png`)
          runAnimation(AvatarStates.WAVE)
        }
      }
    },
    {
      body: <img src="/static/clap1.svg" alt="Clap" />,
      containerProps: {
        onClick: () => {
          changeTexture(`${process.env.VITE_FILE_SERVER}/projects/default-project/assets/SGT_diffse_yorokobi_2.png`)
          runAnimation(AvatarStates.CLAP)
        }
      }
    },
    {
      body: <img src="/static/Dance1.svg" alt="Dance 1" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE1)
      }
    },
    {
      body: <img src="/static/Dance2.svg" alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE2)
      }
    },
    {
      body: <img src="/static/Dance3.svg" alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE3)
      }
    },
    // {
    //   body: <img src="/static/Dance4.svg" alt="Dance 4" />,
    //   containerProps: {
    //     onClick: () => runAnimation(AvatarStates.DANCE4)
    //   }
    // },
    {
      body: <img src="/static/Kiss.svg" alt="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.KISS)
      }
    },
    {
      body: <img src="/static/Cry.svg" alt="Cry" />,
      containerProps: {
        onClick: () => {
          changeTexture(`${process.env.VITE_FILE_SERVER}/projects/default-project/assets/SGT_diffse_naki_2.png`)
          runAnimation(AvatarStates.CRY)
        }
      }
    },
    {
      body: <img src="/static/Laugh.svg" alt="Laugh" />,
      containerProps: {
        onClick: () => {
          changeTexture(`${process.env.VITE_FILE_SERVER}/projects/default-project/assets/SGT_diffse_mewotumuru_2.png`)
          runAnimation(AvatarStates.LAUGH)
        }
      }
    },
    {
      body: <img src="/static/Defeat.svg" alt="Defeat" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DEFEAT)
      }
    },
    {
      body: <img src="/static/restart.svg" alt="Reset" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOCOMOTION)
      }
    }
  ])

  const calculateMenuRadius = () => {
    setImgPerPage(getEmotePerPage())
    setMenuRadius(window.innerWidth > 360 ? 182 : 150)
    calculateOtherValues()
  }

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
    calculateOtherValues()
  }, [])

  const closeMenu = (e) => {
    e.preventDefault()
    PopupMenuServices.showPopupMenu()
  }

  const calculateOtherValues = (): void => {
    menuThickness = menuRadius > 170 ? 70 : 60
    menuItemWidth = menuThickness - menuPadding
    menuItemRadius = menuItemWidth / 2
    effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2
  }

  const runAnimation = (stateName: string) => {
    const entity = Engine.instance.localClientEntity
    changeAvatarAnimationState(entity, stateName)
    // close Menu after playing animation
    PopupMenuServices.showPopupMenu()
  }

  const renderEmoteList = () => {
    const itemList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, items.length)
    let angle = 360 / imgPerPage
    let index = 0
    let itemAngle = 0
    let x = 0
    let y = 0

    for (let i = startIndex; i < endIndex; i++, index++) {
      const emoticon = items[i]
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)

      itemList.push(
        <div key={i}>
          <Button
            className={styles.menuItem}
            {...emoticon.containerProps}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            style={{
              width: menuItemWidth,
              height: menuItemWidth,
              transform: `translate(${x}px , ${y}px)`
            }}
          >
            {emoticon.body}
          </Button>
        </div>
      )
    }

    return itemList
  }

  const loadNextEmotes = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= items.length) return
    setPage(page + 1)
  }
  const loadPreviousEmotes = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  return {
    closeMenu,
    menuRadius,
    menuThickness,
    loadPreviousEmotes,
    menuItemRadius,
    renderEmoteList,
    page,
    imgPerPage,
    items,
    loadNextEmotes
  }
}

const EmoteMenu = (): JSX.Element => {
  const {
    closeMenu,
    menuRadius,
    menuThickness,
    loadPreviousEmotes,
    menuItemRadius,
    renderEmoteList,
    page,
    imgPerPage,
    items,
    loadNextEmotes
  } = useEmoteMenuHooks()

  return (
    <section className={styles.emoteMenu}>
      <ClickAwayListener onClickAway={closeMenu} mouseEvent="onMouseDown">
        <div
          className={styles.itemContainer}
          style={{
            width: menuRadius * 2,
            height: menuRadius * 2,
            borderWidth: menuThickness
          }}
        >
          <div className={styles.itemContainerPrev}>
            <button
              type="button"
              className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
              onClick={loadPreviousEmotes}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              <Icon type="NavigateBefore" />
            </button>
          </div>
          <div
            className={styles.menuItemBlock}
            style={{
              width: menuItemRadius,
              height: menuItemRadius
            }}
          >
            {renderEmoteList()}
          </div>
          <div className={styles.itemContainerNext}>
            <button
              type="button"
              className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= items.length ? styles.disabled : ''}`}
              onClick={loadNextEmotes}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              <Icon type="NavigateNext" />
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </section>
  )
}

export default EmoteMenu
