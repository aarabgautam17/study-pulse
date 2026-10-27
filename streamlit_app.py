import streamlit as st
import time
import json
import os
from datetime import datetime, date

# ==============================================================================
# StudyPulse AI — School Innovation Challenge Edition (Grade 8 & 9)
# Custom styled to match the modern Indigo & White UI
# ==============================================================================

st.set_page_config(
    page_title="StudyPulse AI — Smart Study & Revision",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ------------------------------------------------------------------------------
# High-End Custom CSS (Turns Streamlit into a clean, modern SaaS app)
# ------------------------------------------------------------------------------
st.markdown("""
<style>
    /* Global App Background & Text */
    .stApp {
        background-color: #f8fafc !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid #e2e8f0 !important;
    }
    
    section[data-testid="stSidebar"] .stMarkdown p {
        color: #334155 !important;
    }

    /* Modern Card Container */
    .pulse-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
        margin-bottom: 20px;
    }

    /* Headings */
    h1, h2, h3, h4 {
        color: #0f172a !important;
        font-weight: 800 !important;
        letter-spacing: -0.025em !important;
    }

    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 14px !important;
        padding: 10px 24px !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25) !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35) !important;
    }

    /* Input Fields */
    .stTextInput > div > div > input, .stTextArea > div > div > textarea, .stSelectbox > div > div {
        background-color: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 12px !important;
        color: #0f172a !important;
    }
    .stTextInput > div > div > input:focus, .stTextArea > div > div > textarea:focus {
        border-color: #4f46e5 !important;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15) !important;
    }

    /* Metric Badges */
    div[data-testid="stMetricValue"] {
        color: #4f46e5 !important;
        font-weight: 800 !important;
    }

    /* Flashcard Visual Style */
    .flashcard {
        background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
        border: 2px solid #e0e7ff;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.07);
    }
    .flashcard-term {
        font-size: 16px;
        font-weight: 700;
        color: #312e81;
        margin-bottom: 8px;
    }
    .flashcard-def {
        font-size: 14px;
        color: #334155;
        line-height: 1.5;
    }

    /* Pill Badges */
    .badge-pill {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        background-color: #e0e7ff;
        color: #4338ca;
        margin-right: 8px;
    }
</style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 1. Gemini AI Client Setup
# ------------------------------------------------------------------------------
GEMINI_KEY = os.environ.get("GEMINI_API_KEY") or st.secrets.get("GEMINI_API_KEY", None)

try:
    from google import genai
    from google.genai import types
    has_genai = True
except ImportError:
    has_genai = False

def call_gemini(system_prompt: str, user_prompt: str, api_key: str):
    """Calls Gemini 2.5 Flash with strict Socratic pedagogical rules."""
    if not api_key:
        return "⚠️ Please enter your Gemini API Key in the left sidebar."
    
    if not has_genai:
        return "⚠️ `google-genai` library not found. Run: pip install google-genai"

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7
            )
        )
        return response.text
    except Exception as e:
        return f"❌ Error contacting Gemini: {str(e)}"

# ------------------------------------------------------------------------------
# 2. State Setup
# ------------------------------------------------------------------------------
if "profile" not in st.session_state:
    st.session_state.profile = None

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

if "exams" not in st.session_state:
    st.session_state.exams = []

if "study_logs" not in st.session_state:
    st.session_state.study_logs = []

if "xp" not in st.session_state:
    st.session_state.xp = 0

if "flashcards" not in st.session_state:
    st.session_state.flashcards = []

if "quiz_questions" not in st.session_state:
    st.session_state.quiz_questions = []

# ------------------------------------------------------------------------------
# 3. Sidebar
# ------------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🎓 StudyPulse AI")
    st.markdown("<span class='badge-pill'>Grade 8 & 9 Edition</span>", unsafe_allow_html=True)
    st.write("")
    
    api_key_input = st.text_input(
        "Gemini API Key",
        value=GEMINI_KEY if GEMINI_KEY else "",
        type="password",
        help="Paste your Google AI Studio API key here"
    )

    menu = st.radio(
        "Navigation",
        [
            "🏠 Dashboard",
            "🤖 Socratic AI Tutor",
            "📝 Revision Generator",
            "⏱️ Study Timer",
            "📅 Exam Schedule",
            "🏆 Achievements & Badges"
        ]
    )

    st.markdown("---")
    st.markdown("**🚀 School Innovation Challenge**")
    st.caption("Kartik 13, 2083 Submission")
    st.link_button("Official Registration Form", "https://forms.gle/ewaDJM8XFUiXyfoFA")

# ------------------------------------------------------------------------------
# 4. First-Time Setup Screen
# ------------------------------------------------------------------------------
if st.session_state.profile is None:
    st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
    st.title("👋 Welcome to StudyPulse AI")
    st.write("Personalized Socratic AI study companion built for middle and high school students.")
    
    with st.form("student_setup"):
        c1, c2 = st.columns(2)
        with c1:
            s_name = st.text_input("Your Full Name", placeholder="e.g. Aarab Gautam")
            s_grade = st.selectbox("Grade", ["Grade 8", "Grade 9", "Grade 10"])
        with c2:
            s_email = st.text_input("Student Email", placeholder="student@school.edu")
            s_goal = st.number_input("Weekly Goal (Study Hours)", min_value=1, max_value=50, value=12)

        s_subjects = st.text_input(
            "Enrolled Subjects (comma separated)",
            value="Science, Mathematics, English, Social Studies, Computer Science"
        )

        btn = st.form_submit_button("🚀 Set Up My Profile")
        if btn:
            if not s_name.strip():
                st.error("Please enter your name.")
            else:
                subs = [s.strip() for s in s_subjects.split(",") if s.strip()]
                st.session_state.profile = {
                    "name": s_name,
                    "grade": s_grade,
                    "email": s_email,
                    "weekly_goal": s_goal,
                    "subjects": subs,
                }
                st.session_state.xp += 50
                st.success("Welcome aboard! +50 XP unlocked.")
                st.rerun()
    st.markdown("</div>", unsafe_allow_html=True)
    st.stop()

# ------------------------------------------------------------------------------
# 5. Dashboard
# ------------------------------------------------------------------------------
if menu == "🏠 Dashboard":
    p = st.session_state.profile
    
    st.markdown(f"""
    <div class='pulse-card' style='background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white !important;'>
        <h1 style='color: white !important; margin-bottom: 4px;'>Hi, {p['name']}! 👋</h1>
        <p style='color: #c7d2fe; margin-bottom: 0;'>{p['grade']} Scholar • Level {1 + st.session_state.xp // 100} • <b>{st.session_state.xp} XP</b></p>
    </div>
    """, unsafe_allow_html=True)

    total_mins = sum(item["minutes"] for item in st.session_state.study_logs)
    hours = round(total_mins / 60, 1)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
        st.metric("Weekly Target", f"{p['weekly_goal']} hrs")
        st.markdown("</div>", unsafe_allow_html=True)
    with c2:
        st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
        st.metric("Hours Studied", f"{hours} hrs", delta=f"{round((hours / max(1, p['weekly_goal'])) * 100)}% done")
        st.markdown("</div>", unsafe_allow_html=True)
    with c3:
        st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
        st.metric("Total Experience", f"{st.session_state.xp} XP", delta="+50 today")
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
    st.subheader("🎯 Weekly Goal Progress")
    st.progress(min(1.0, hours / max(1, p['weekly_goal'])))
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='pulse-card'>", unsafe_allow_html=True)
    st.subheader("📅 Upcoming Exams & Deadlines")
    if not st.session_state.exams:
        st.info("No exam deadlines yet. Head to 'Exam Schedule' to add your upcoming tests!")
    else:
        for ex in sorted(st.session_state.exams, key=lambda x: x["date"]):
            days = (datetime.strptime(ex["date"], "%Y-%m-%d").date() - date.today()).days
            st.markdown(f"• **{ex['subject']}**: {ex['title']} — `{ex['date']}` (**{days} days remaining**)")
    st.markdown("</div>", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 6. Socratic AI Tutor
# ------------------------------------------------------------------------------
elif menu == "🤖 Socratic AI Tutor":
    st.markdown("""
    <div class='pulse-card'>
        <h2>🤖 Socratic AI Tutor</h2>
        <p style='color: #475569;'>Strict Anti-Cheating: Guides you step-by-step with probing questions and hints instead of doing your homework for you.</p>
    </div>
    """, unsafe_allow_html=True)

    subj = st.selectbox("Subject Focus", st.session_state.profile["subjects"])

    # Chat history
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_query = st.chat_input("Ask a concept or question (e.g. 'How does photosynthesis work?')")

    if user_query:
        st.session_state.chat_history.append({"role": "user", "content": user_query})
        with st.chat_message("user"):
            st.markdown(user_query)

        SOCRATIC_PROMPT = f"""
You are the Socratic AI Study Coach for a {st.session_state.profile['grade']} student studying {subj}.
Pedagogical Directives:
1. NEVER reveal the direct answers to homework exercises or math equations.
2. Instead, break down the problem, give intuitive hints, and ask guiding questions to lead the student to their own solution.
3. Keep tone encouraging, patient, and easy to understand for middle/high school.
"""
        with st.chat_message("assistant"):
            with st.spinner("Formulating guiding questions..."):
                response = call_gemini(SOCRATIC_PROMPT, user_query, api_key_input)
                st.markdown(response)
                st.session_state.chat_history.append({"role": "assistant", "content": response})
                st.session_state.xp += 10

# ------------------------------------------------------------------------------
# 7. Revision Generator
# ------------------------------------------------------------------------------
elif menu == "📝 Revision Generator":
    st.markdown("""
    <div class='pulse-card'>
        <h2>📝 Personalized Revision Kit Generator</h2>
        <p style='color: #475569;'>Turn your textbook chapters or rough notes into interactive flashcards and quiz questions.</p>
    </div>
    """, unsafe_allow_html=True)

    rev_subj = st.selectbox("Select Subject", st.session_state.profile["subjects"])
    notes = st.text_area(
        "Paste Textbook Notes or Lesson Content",
        placeholder="Paste your science or history notes here...",
        height=160
    )

    c1, c2 = st.columns(2)
    with c1:
        if st.button("🗂️ Generate Flashcards", use_container_width=True):
            if not notes.strip():
                st.warning("Please paste some notes first.")
            else:
                prompt = f"""
Create 4-6 flashcards for a middle school student from this text.
Return ONLY a valid JSON array:
[
  {{"front": "Key Term or Question", "back": "Clear concise explanation"}}
]
Text:
{notes}
"""
                with st.spinner("Generating flashcards..."):
                    res = call_gemini("You are a revision aid generator. Return JSON only.", prompt, api_key_input)
                    try:
                        clean = res.replace("```json", "").replace("```", "").strip()
                        st.session_state.flashcards = json.loads(clean)
                        st.session_state.xp += 25
                        st.success("Flashcards generated! +25 XP")
                    except Exception:
                        st.markdown(res)

    with c2:
        if st.button("❓ Generate Practice Quiz", use_container_width=True):
            if not notes.strip():
                st.warning("Please paste some notes first.")
            else:
                prompt = f"""
Create 3 multiple choice questions based on this text.
Return ONLY a valid JSON array:
[
  {{
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer_index": 0,
    "hint": "Guiding hint",
    "explanation": "Why this is correct"
  }}
]
Text:
{notes}
"""
                with st.spinner("Generating quiz..."):
                    res = call_gemini("You are a quiz master. Return JSON only.", prompt, api_key_input)
                    try:
                        clean = res.replace("```json", "").replace("```", "").strip()
                        st.session_state.quiz_questions = json.loads(clean)
                        st.session_state.xp += 30
                        st.success("Quiz generated! +30 XP")
                    except Exception:
                        st.markdown(res)

    if st.session_state.flashcards:
        st.write("")
        st.subheader("🗂️ Generated Flashcards")
        for i, card in enumerate(st.session_state.flashcards, 1):
            st.markdown(f"""
            <div class='flashcard'>
                <div class='flashcard-term'>Card {i}: {card.get('front', '')}</div>
                <div class='flashcard-def'>{card.get('back', '')}</div>
            </div>
            """, unsafe_allow_html=True)

    if st.session_state.quiz_questions:
        st.write("")
        st.subheader("❓ Practice Quiz")
        for i, q in enumerate(st.session_state.quiz_questions, 1):
            st.markdown(f"**Q{i}. {q['question']}**")
            ans = st.radio(f"Your answer for Q{i}:", q["options"], key=f"ans_{i}")
            with st.expander("Show Hint"):
                st.caption(f"💡 {q.get('hint', 'Review the key concepts above.')}")
            if st.button(f"Check Answer for Q{i}", key=f"chk_{i}"):
                if q["options"].index(ans) == q["answer_index"]:
                    st.success(f"🎉 Correct! {q.get('explanation', '')}")
                    st.session_state.xp += 15
                else:
                    st.error(f"Try again. {q.get('explanation', '')}")

# ------------------------------------------------------------------------------
# 8. Study Timer
# ------------------------------------------------------------------------------
elif menu == "⏱️ Study Timer":
    st.markdown("""
    <div class='pulse-card'>
        <h2>⏱️ Focus Pomodoro Timer</h2>
        <p style='color: #475569;'>Set custom intervals for focused study and earn XP when you complete them.</p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        timer_sub = st.selectbox("Subject", st.session_state.profile["subjects"])
    with col2:
        duration = st.slider("Focus Minutes", 1, 60, 25)

    if st.button("▶️ Start Focus Session"):
        p_bar = st.progress(0)
        time_slot = st.empty()
        
        total = duration * 60
        # Fast preview demo countdown
        for s in range(min(total, 15)):
            rem = total - s
            time_slot.markdown(f"### ⏳ Remaining: `{rem // 60:02d}:{rem % 60:02d}`")
            p_bar.progress((s + 1) / min(total, 15))
            time.sleep(1)

        st.balloons()
        st.success(f"Session finished! You logged {duration} minutes of focus on {timer_sub}.")
        st.session_state.study_logs.append({
            "subject": timer_sub,
            "minutes": duration,
            "date": str(date.today())
        })
        st.session_state.xp += duration * 2
        st.info(f"Awarded +{duration * 2} XP!")

# ------------------------------------------------------------------------------
# 9. Exam Schedule
# ------------------------------------------------------------------------------
elif menu == "📅 Exam Schedule":
    st.markdown("""
    <div class='pulse-card'>
        <h2>📅 Exam & Assessment Deadlines</h2>
        <p style='color: #475569;'>Track upcoming tests and countdowns.</p>
    </div>
    """, unsafe_allow_html=True)

    with st.form("exam_form"):
        c1, c2 = st.columns(2)
        with c1:
            ex_sub = st.selectbox("Subject", st.session_state.profile["subjects"])
            ex_title = st.text_input("Exam Name / Topic", placeholder="e.g. Cell Biology Unit Test")
        with c2:
            ex_dt = st.date_input("Date")
            ex_goal = st.text_input("Target Score", placeholder="e.g. 95%")
        
        if st.form_submit_button("➕ Add Exam"):
            st.session_state.exams.append({
                "subject": ex_sub,
                "title": ex_title,
                "date": str(ex_dt),
                "goal": ex_goal
            })
            st.success("Exam added!")
            st.rerun()

    if st.session_state.exams:
        st.subheader("Your Scheduled Tests")
        for ex in st.session_state.exams:
            days = (datetime.strptime(ex["date"], "%Y-%m-%d").date() - date.today()).days
            st.markdown(f"• **{ex['subject']}**: {ex['title']} on `{ex['date']}` (**{days} days remaining**)")

# ------------------------------------------------------------------------------
# 10. Achievements & Badges
# ------------------------------------------------------------------------------
elif menu == "🏆 Achievements & Badges":
    st.markdown(f"""
    <div class='pulse-card' style='background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white;'>
        <h2 style='color: white !important;'>🏆 Scholar Milestones</h2>
        <p style='color: #d1fae5; font-size: 18px; font-weight: 700;'>Total Experience: {st.session_state.xp} XP</p>
    </div>
    """, unsafe_allow_html=True)

    badges = [
        {"name": "🌱 Setup Complete", "desc": "Created student profile", "unlocked": st.session_state.xp >= 50},
        {"name": "🧠 Socratic Thinker", "desc": "Chatted with AI Tutor", "unlocked": st.session_state.xp >= 60},
        {"name": "🗂️ Flashcard Pro", "desc": "Created custom flashcards", "unlocked": len(st.session_state.flashcards) > 0},
        {"name": "⏱️ Focus Master", "desc": "Logged a study session", "unlocked": len(st.session_state.study_logs) > 0},
        {"name": "🌟 Top Scholar", "desc": "Reached 150+ XP", "unlocked": st.session_state.xp >= 150},
    ]

    cols = st.columns(len(badges))
    for col, b in zip(cols, badges):
        with col:
            if b["unlocked"]:
                st.success(f"**{b['name']}**\n\n{b['desc']}\n\n✅ Unlocked")
            else:
                st.warning(f"**{b['name']}**\n\n{b['desc']}\n\n🔒 Locked")
