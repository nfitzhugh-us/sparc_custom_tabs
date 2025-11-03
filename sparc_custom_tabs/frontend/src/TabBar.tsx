import React, { ComponentProps, ReactNode } from "react"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection
} from "streamlit-component-lib"

// Build marker: change this string between builds (or inject via env var) so you can tell which bundle loaded.
console.log("TABBAR_BUNDLE_ID: local-dev-or-rebuild-20251103-01")

interface MenuItem {
  id: number | string
  title: string
  description: string
}

interface State {
  numClicks: number
  selectedId: number
  list: MenuItem[]
  hasOverflow: boolean
  showLeftButton: boolean
  showRightButton: boolean
}

class TabBar extends StreamlitComponentBase<State> {
  public state: State = { 
    numClicks: 0, 
    selectedId: 1, 
    list: [],
    hasOverflow: false,
    showLeftButton: false,
    showRightButton: false
  }

  private prevArgs: any = null
  private lastSentValue: number | null = null
  private containerRef: React.RefObject<HTMLDivElement>
  private itemRefs: Map<string | number, HTMLDivElement | null>

  constructor(props: ComponentProps<any>) {
    super(props)
    console.log("TabBar constructor - props:", props)
    const args = (props as any).args || {}

    const sampleList: MenuItem[] = [
      { id: 0, title: "material:add", description: "New Tab" }
    ]

    const data = Array.isArray(args.data) && args.data.length > 0 ? args.data : sampleList
    const selectedId = Number(args.selectedId ?? data[0]?.id ?? 0)

    this.state = { 
      numClicks: 0, 
      selectedId, 
      list: data,
      hasOverflow: false,
      showLeftButton: false,
      showRightButton: false
    }
    this.prevArgs = args
    console.log("TabBar constructor - initial state:", this.state)

    this.containerRef = React.createRef()
    this.itemRefs = new Map()

    if (typeof args.selectedId !== "undefined") {
      this.lastSentValue = selectedId
      Streamlit.setComponentValue(selectedId)
    }
  }

  componentDidMount(): void {
    Streamlit.setFrameHeight(55.5)
    this.checkOverflow()
    window.addEventListener('resize', this.checkOverflow)
    if (this.containerRef.current) {
      this.containerRef.current.addEventListener('scroll', this.checkOverflow)
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.checkOverflow)
    if (this.containerRef.current) {
      this.containerRef.current.removeEventListener('scroll', this.checkOverflow)
    }
  }

  componentDidUpdate(): void {
    const args = ((this.props as any).args) || {}
    const prevArgs = this.prevArgs || {}

    if (prevArgs.data !== args.data || String(prevArgs.selectedId) !== String(args.selectedId)) {
      const data = Array.isArray(args.data) ? args.data : this.state.list
      const selectedId = Number(args.selectedId ?? data[0]?.id ?? this.state.selectedId)
      console.log("componentDidUpdate: updating state from props.args:", { selectedId, data })

      this.setState({ list: data, selectedId }, () => {
        this.scrollToSelected()
        this.checkOverflow()

        if (this.lastSentValue !== selectedId) {
          console.log("componentDidUpdate: sending selectedId to Streamlit:", selectedId)
          this.lastSentValue = selectedId
          Streamlit.setComponentValue(selectedId)
        }
      })
    }

    this.prevArgs = args
  }

  private checkOverflow = () => {
    if (this.containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = this.containerRef.current
      const hasOverflow = scrollWidth > clientWidth
      const showLeftButton = scrollLeft > 0
      const showRightButton = scrollLeft + clientWidth < scrollWidth

      if (
        this.state.hasOverflow !== hasOverflow ||
        this.state.showLeftButton !== showLeftButton ||
        this.state.showRightButton !== showRightButton
      ) {
        this.setState({ hasOverflow, showLeftButton, showRightButton })
      }
    }
  }

  private setItemRef = (id: string | number) => (el: HTMLDivElement | null) => {
    this.itemRefs.set(String(id), el)
  }

  private scrollToSelected = () => {
    const sel = this.state.selectedId
    const el = this.itemRefs.get(String(sel))
    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
      } catch (e) {
        if (this.containerRef.current && el.offsetLeft != null) {
          this.containerRef.current.scrollLeft = el.offsetLeft - (this.containerRef.current.clientWidth / 2) + (el.clientWidth / 2)
        }
      }
    }
  }

  private scrollLeft = () => {
    if (this.containerRef.current) {
      this.containerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  private scrollRight = () => {
    if (this.containerRef.current) {
      this.containerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
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
        ref={this.setItemRef(item.id)}
        className={`menu-item ${isActive ? "active" : ""}`}
        onClick={handleClick}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 1px",
          flex: "0 0 175px",
          width: 175
        }}
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

  public render = (): ReactNode => {
    console.log("TabBar render - current state:", this.state)

    const menu = this.state.list.map((item) => (
      <this.MenuItem item={item} selectedId={this.state.selectedId} key={item.id} />
    ))

    return (
      <div style={{ position: 'relative' }}>
        {this.state.showLeftButton && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '110px',
            background: 'linear-gradient(to right, rgba(18, 35, 63), rgb(18, 35, 63, 0)',
            zIndex: 1,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <button onClick={this.scrollLeft} style={{ 
              pointerEvents: 'auto',
              marginLeft: '5px',
              cursor: 'pointer',
              border: '1px solid #344b6e',
              borderRadius: '5px',
              textAlign: 'center',
              backgroundColor: '#203354',
              fontSize: '14px',
              padding: '5px 0px 5px 10px',
              color: '#edeff1',
              fontWeight: 'semibold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons">arrow_back_ios</span>
            </button>
          </div>
        )}

        <div
          ref={this.containerRef}
          style={{
            overflowX: "hidden",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "left",
            padding: "8px 0px",
            flex: "1 1 auto"
          }}
        >
          {menu}
        </div>

        {this.state.showRightButton && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '110px',
            background: 'linear-gradient(to left, rgba(18, 35, 63), rgb(18, 35, 63, 0)',
            zIndex: 1,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}>
            <button onClick={this.scrollRight} style={{ 
              pointerEvents: 'auto',
              marginRight: '5px',
              cursor: 'pointer',
              border: '1px solid #344b6e',
              borderRadius: '5px',
              textAlign: 'center',
              backgroundColor: '#203354',
              fontSize: '14px',
              padding: '5px 5px',
              color: '#edeff1',
              fontWeight: 'semibold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-icons">arrow_forward_ios</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  onSelect = (id: any) => {
    const numericId = Number(id)
    console.log("onSelect called with id:", id, "-> numericId:", numericId, "type:", typeof id)

    this.setState(
      () => {
        console.log("Setting state, new selectedId:", numericId)
        return { selectedId: numericId }
      },
      () => {
        this.scrollToSelected()

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