import React, { useState } from "react"

type FindFromUnion<Target extends {}, KeyProp extends keyof Target, Key extends Target[KeyProp]> = Target extends {
  [x in KeyProp]: Key
}
  ? Target
  : never

type ChatItem =
  | { type: "empty" }
  | {
      type: "message-user"
      message: string
    }
  | {
      type: "message-ai"
      isLoading?: boolean
      message?: string
    }
  | {
      type: "task"
      isLoading?: boolean
      task?: { title: string }
    }

export function useChatList() {
  const [list, setList] = useState<ChatItem[]>([])

  /**
   * 参考: {@link React.SetStateAction}
   * ↑との違いは、prevStateにundefinedを含むかどうか
   */
  type SetStateAction<A> = A | ((prevState: A | undefined) => A)

  function update<Type extends ChatItem["type"]>(
    type: Type,
    updater: SetStateAction<FindFromUnion<ChatItem, "type", Type>>,
  ) {
    const callUpdater = (item?: ChatItem): ChatItem => {
      if (typeof updater === "function") {
        return updater({ ...item, type } as any)
      } else {
        return { ...updater, type }
      }
    }

    // NOTE: チャットUIでは`whiteSpace="pre-wrap"`する都合上、逆順にする必要がある
    //       つまり、`list[0]`が最新のitemになるようにしている
    setList(prevList => {
      const currentItem = prevList[0] as ChatItem | undefined
      const isMatchType = currentItem && currentItem.type === type

      if (!isMatchType) {
        // typeが一致しなかった場合、新しいitemとして追加する
        return [callUpdater(), ...prevList]
      } else {
        // typeが一致した場合、最後のitemを差し替える
        if (prevList.length === 0) return prevList

        const updatedList = [...prevList]
        updatedList[0] = callUpdater(currentItem)
        return updatedList
      }
    })
  }

  return { list, update }
}
