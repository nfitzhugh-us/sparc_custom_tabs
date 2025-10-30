import streamlit as st
import sparc_custom_tabs as tabs

import sparc_custom_tabs as tabs

stepper_tabs = []
stepper_tabs.append(tabs.TabBarItemData(id = 0, title = 'Title', description = "description"))
tabs.tab_bar(data = stepper_tabs, default = 0)