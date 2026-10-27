import streamlit as st
import streamlit.components.v1 as components

# ==============================================================================
# StudyPulse AI - School Innovation Challenge Edition
# This embeds your full-featured React + Tailwind + Lo-Fi Audio application
# directly inside Streamlit so you get the exact, gorgeous UI!
# ==============================================================================

st.set_page_config(
    page_title="StudyPulse AI — Smart Study & Revision",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit default header, footer, and padding for a clean full-screen look
st.markdown("""
<style>
    /* Hide Streamlit default chrome */
    #MainMenu {visibility: hidden !important;}
    footer {visibility: hidden !important;}
    header {visibility: hidden !important;}
    div[data-testid="stToolbar"] {visibility: hidden !important;}
    
    /* Remove padding around the page */
    .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 100% !important;
    }
    
    iframe {
        border: none !important;
        width: 100% !important;
        height: 100vh !important;
    }
</style>
""", unsafe_allow_html=True)

# URL of your live StudyPulse applet built with React + Tailwind + Lo-Fi Player
APP_URL = "https://ais-pre-nf6uhdcdeuhx4d4aixiyky-657503714541.asia-southeast1.run.app"

# Embed the full application seamlessly
components.iframe(APP_URL, height=950, scrolling=True)
