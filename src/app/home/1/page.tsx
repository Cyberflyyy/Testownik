"use client";
import { useState } from 'react';
import React from 'react'
import Header_main from '@/components/header_main'
import Body_main from '@/components/body_main'
const page = () => {
    const [isTestStarted, setIsTestStarted] = useState(false)
    const handleReturnToStart = () => {
        
        setIsTestStarted(false)
      }
  return (
    <>
    <Header_main />
    <Body_main  />
    </>
  )
}

export default page
