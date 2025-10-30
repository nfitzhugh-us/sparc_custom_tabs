import streamlit as st
import sparc_custom_tabs as tabs

import sparc_custom_tabs as tabs

st.title("Tabs Test")

stepper_tabs = [tabs.TabBarItemData(id = 0, title = 'Tab 1', description = "description"), tabs.TabBarItemData(id = 1, title = 'Tab 2', description = "description"), tabs.TabBarItemData(id = 2, title = 'Tab 3', description = "description")]
active_tab = tabs.tab_bar(data = stepper_tabs, default = 0)
st.info(f"active tab = {active_tab}")