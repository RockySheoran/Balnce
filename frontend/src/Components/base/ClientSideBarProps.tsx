/** @format */

"use client"
import React, { useState } from "react"

import { Session } from "next-auth"
import Sidebar from "./SideBarMange"




interface ClientSideBarProps {
  session: Session & { token?: string }
}

export function ClientSideBar({ session }: ClientSideBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={""}>
    <Sidebar
      session={session}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    />
    </div>
  )
}
