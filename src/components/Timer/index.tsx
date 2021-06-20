import React, { useRef, useEffect, useState } from 'react'
import { TYPE } from 'theme'
import { secondsToTime } from 'utils'

export default function Timer({ seconds }: { seconds: number }) {
  const [num, setNum] = useState(seconds)
  const [formattedTime, updatedFormattedTime] = useState<string | undefined>(undefined)

  const intervalRef = useRef<any>()

  const decreaseNum = () => setNum(prev => prev - 1)

  useEffect(() => {
    intervalRef.current = setInterval(decreaseNum, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    const { hours, minutes, seconds } = secondsToTime(num)
    const hourSection = hours == '00' ? '' : `${hours}:`
    updatedFormattedTime(`${hourSection}${minutes}:${seconds}`)
  }, [num])

  return <TYPE.subHeader>{formattedTime}</TYPE.subHeader>
}
