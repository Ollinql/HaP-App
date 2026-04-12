import { useState } from 'react'

interface ModalState<T> {
  isOpen: boolean
  data: T | undefined
  open: (item?: T) => void
  close: () => void
}

export function useModalState<T>(): ModalState<T> {
  const [state, setState] = useState<{ isOpen: boolean; data: T | undefined }>({
    isOpen: false,
    data: undefined,
  })

  function open(item?: T) {
    setState({ isOpen: true, data: item })
  }

  function close() {
    setState({ isOpen: false, data: undefined })
  }

  return { isOpen: state.isOpen, data: state.data, open, close }
}
