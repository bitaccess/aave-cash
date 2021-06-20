import { toast } from 'react-toast'

type ToastTypes = 'success' | 'error' | 'warn' | 'info' | 'custom'

const useToast = () => (type: ToastTypes, message: string) => {
  if (type === 'custom') {
    return toast(message)
  }
  return toast[type](message)
}

export default useToast
