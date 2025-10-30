import React, { ComponentProps, ReactNode } from "react"
import ScrollMenu from "react-horizontal-scrolling-menu"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection
} from "streamlit-component-lib"

interface MenuItem {
  id: number | string
  title: string
  description: string
}

interface State {
  numClicks: number
  selectedId: number
  list: MenuItem[]
}

class TabBar extends StreamlitComponentBase<State> {
  public state: State = { numClicks: 0, selectedId: 1, list: [] }

  // Keep a copy of the last-seen args for comparisons (componentDidUpdate must have no args)
  private prevArgs: any = null
  // Remember the last value we sent back to Streamlit to avoid duplicate sends / loops
  private lastSentValue: number | null = null

  constructor(props: ComponentProps<any>) {
    super(props)
    console.log("TabBar constructor - props:", props)
    const args = (props as any).args || {}

    // Temporary sample data for dev (keeps UI visible when args are not yet provided)
    const sampleList: MenuItem[] = [
      { id: 0, title: "material:add", description: "New Tab" }
    ]

    const data = Array.isArray(args.data) && args.data.length > 0 ? args.data : sampleList
    const selectedId = Number(args.selectedId ?? data[0]?.id ?? 0)

    this.state = { numClicks: 0, selectedId, list: data }
    this.prevArgs = args
    console.log("TabBar constructor - initial state:", this.state)

    // If args already provided on construction, send initial value to Streamlit.
    // (This ensures Python sees the same selectedId the UI renders.)
    if (typeof args.selectedId !== "undefined") {
      this.lastSentValue = selectedId
      Streamlit.setComponentValue(selectedId)
    }
  }

  // componentDidUpdate signature must be parameterless to satisfy StreamlitComponentBase typing.
  componentDidUpdate(): void {
    const args = ((this.props as any).args) || {}
    const prevArgs = this.prevArgs || {}

    // If data or selectedId changed, update internal state
    if (prevArgs.data !== args.data || String(prevArgs.selectedId) !== String(args.selectedId)) {
      const data = Array.isArray(args.data) ? args.data : this.state.list
      const selectedId = Number(args.selectedId ?? data[0]?.id ?? this.state.selectedId)
      console.log("componentDidUpdate: updating state from props.args:", { selectedId, data })

      // Update state and then (in callback) send the selectedId back to Streamlit if needed.
      this.setState({ list: data, selectedId }, () => {
        // Only send if it's different from what we last sent (prevents loops)
        if (this.lastSentValue !== selectedId) {
          console.log("componentDidUpdate: sending selectedId to Streamlit:", selectedId)
          this.lastSentValue = selectedId
          Streamlit.setComponentValue(selectedId)
        }
      })
    }

    // Save the latest args for next comparison
    this.prevArgs = args
  }

  MenuItem = ({ item, selectedId }: { item: MenuItem; selectedId: number }) => {
    const handleClick = () => {
      console.log("MenuItem clicked:", item.id, item.title)
      this.onSelect(item.id)
    }

    const isActive = Number(selectedId) === Number(item.id)
    console.log(
      `MenuItem ${item.id}: selectedId=${selectedId}, item.id=${item.id}, isActive=${isActive}`
    )

    return (
      <div
        className={`menu-item ${isActive ? "active" : ""}`}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {typeof item.title === "string" && item.title.startsWith("material:") ? (
            <span className="material-icons" style={{ marginRight: "4px" }}>
              {item.title.replace("material:", "")}
            </span>
          ) : (
            item.title
          )}
        </div>
        <div style={{ fontWeight: "normal", fontStyle: "italic" }}>{item.description}</div>
      </div>
    )
  }

  Menu(list: Array<MenuItem>, selectedId: number) {
    return list.map((item) => <this.MenuItem item={item} selectedId={selectedId} key={item.id} />)
  }

  Arrow = ({ text, className }: { text: string; className: string }) => {
    return <div className={className}>{text}</div>
  }

  ArrowLeft = this.Arrow({ text: "<", className: "arrow-prev" })
  ArrowRight = this.Arrow({ text: ">", className: "arrow-next" })

  public render = (): ReactNode => {
    console.log("TabBar render - current state:", this.state)
    return (
      <div>
        <ScrollMenu
          alignCenter={false}
          data={this.Menu(this.state.list, this.state.selectedId)}
          wheel={true}
          scrollToSelected={true}
          selected={`${this.state.selectedId}`}
          onSelect={this.onSelect}
        />
      </div>
    )
  }

  // ScrollMenu will often call onSelect with a string id; accept any and coerce
  onSelect = (id: any) => {
    const numericId = Number(id)
    console.log("onSelect called with id:", id, "-> numericId:", numericId, "type:", typeof id)

    // Update local state and send to Streamlit.
    // Record lastSentValue to prevent a round-trip loop.
    this.setState(
      () => {
        console.log("Setting state, new selectedId:", numericId)
        return { selectedId: numericId }
      },
      () => {
        if (this.lastSentValue !== numericId) {
          this.lastSentValue = numericId
          console.log("onSelect: sending to Streamlit:", numericId)
          Streamlit.setComponentValue(numericId)
        }
      }
    )
  }
}

export default withStreamlitConnection(TabBar)