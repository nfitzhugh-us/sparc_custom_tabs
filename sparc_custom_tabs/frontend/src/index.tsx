import "./bootstrap.min.css"
import React from "react"
import { createRoot } from "react-dom/client"
import TabBar from "./TabBar"

const container = document.getElementById("root")
if (!container) {
  throw new Error("Root container missing in index.html")
}

const root = createRoot(container)
root.render(
  <React.StrictMode>
    <TabBar />
  </React.StrictMode>
)