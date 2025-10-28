import React, { ComponentProps, ReactNode } from "react"
import ScrollMenu from "react-horizontal-scrolling-menu"
import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection
} from "streamlit-component-lib"

interface State {
  numClicks: number
  selectedId: number
}

interface MenuItem {
  id: number
  title: string
  description: string
}

class TabBar extends StreamlitComponentBase<State> {
  public state = { numClicks: 0, selectedId: 1, list: [] }

  constructor(props: ComponentProps<any>) {
    super(props)
    console.log('TabBar constructor - props:', props);
    console.log('TabBar constructor - args:', props.args);
    this.state.list = this.props.args["data"]
    this.state.selectedId = Number(this.props.args["selectedId"]) || 1
    console.log('TabBar constructor - initial state:', this.state);
  }

  MenuItem = ({ item, selectedId }: { item: MenuItem; selectedId: number }) => {
    const handleClick = () => {
      console.log('MenuItem clicked:', item.id, item.title);
      this.onSelect(item.id);
    };

    const isActive = selectedId === item.id;
    console.log(`MenuItem ${item.id}: selectedId=${selectedId}, item.id=${item.id}, isActive=${isActive}`);

    return (
      <div 
        className={`menu-item ${isActive ? "active" : ""}`}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.title.startsWith('material:') ? (
            <span className="material-icons" style={{ marginRight: '4px' }}>
              {item.title.replace('material:', '')}
            </span>
          ) : (
            item.title
          )}
        </div>
        <div style={{ fontWeight: "normal", fontStyle: "italic" }}>
          {item.description}
        </div>
      </div>
    )
  }

  Menu(list: Array<MenuItem>, selectedId: number) {
    return list.map((item) => (
      <this.MenuItem item={item} selectedId={selectedId} key={item.id} />
    ))
  }
  Arrow = ({ text, className }: { text: string; className: string }) => {
    return <div className={className}>{text}</div>
  }

  ArrowLeft = this.Arrow({ text: "<", className: "arrow-prev" })
  ArrowRight = this.Arrow({ text: ">", className: "arrow-next" })

  public render = (): ReactNode => {
    console.log('TabBar render - current state:', this.state);
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

  onSelect = (id: number) => {
    console.log('onSelect called with id:', id, 'type:', typeof id);
    this.setState(
      (state, props) => {
        console.log('Setting state, new selectedId:', id);
        return { selectedId: Number(id) }
      },
      () => {
        console.log('State updated, sending to Streamlit:', id);
        Streamlit.setComponentValue(id)
      }
    )
  }
}

export default withStreamlitConnection(TabBar)