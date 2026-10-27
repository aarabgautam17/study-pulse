import streamlit as st
import time
import json
import os
from datetime import datetime, date

# ==============================================================================
# StudyPulse AI: School Innovation Challenge (Grade 8 & 9)
# Socratic AI Tutor, Revision Generator, Focus Timer & Schedule Manager
# ==============================================================================

st.set_page_config(
    page_title="StudyPulse AI - Smart Study & Revision",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

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
    """Calls Gemini 2.5 Flash using the Google GenAI SDK with strict Socratic rules."""
    if not api_key:
        return "⚠️ Please provide a Gemini API Key in the sidebar or via secrets."
    
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
# 2. Session State Initialization (No assumed data, user sets up their profile)
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
# 3. Sidebar: Navigation & Configuration
# ------------------------------------------------------------------------------
st.sidebar.title("🎓 StudyPulse AI")

api_key_input = st.sidebar.text_input(
    "Gemini API Key",
    value=GEMINI_KEY if GEMINI_KEY else "",
    type="password",
    help="Enter your Google AI Studio API key"
)

# Navigation Menu
menu = st.sidebar.radio(
    "Go to",
    ["🏠 Dashboard", "🤖 Socratic AI Tutor", "📝 Revision Kit Generator", "⏱️ Study Timer", "📅 Exam Schedule", "🏆 Progress & Badges"]
)

st.sidebar.markdown("---")
# School Innovation Challenge Banner
st.sidebar.caption("🚀 **School Innovation Challenge**")
st.sidebar.caption("Category: Top Projects in Grade 8 & 9")
st.sidebar.caption("Deadline: Kartik 13, 2083")
st.sidebar.link_button("Register Project", "https://forms.gle/ewaDJM8XFUiXyfoFA")

# ------------------------------------------------------------------------------
# 4. Onboarding / First-Time Profile Setup Screen
# ------------------------------------------------------------------------------
if st.session_state.profile is None:
    st.header("👋 Welcome to StudyPulse AI")
    st.subheader("Set up your student profile to start")
    
    with st.form("onboarding_form"):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Your Full Name", placeholder="e.g. Aarab Gautam")
            grade = st.selectbox("Grade Level", ["Grade 8", "Grade 9", "Other"])
        with col2:
            email = st.text_input("Student Email", placeholder="student@school.edu")
            weekly_target_hours = st.number_input("Weekly Study Goal (Hours)", min_value=1, max_value=60, value=12)

        subjects_raw = st.text_input(
            "Your Subjects (comma separated)",
            value="Science, Mathematics, English, Social Studies, Computer Science"
        )

        submitted = st.form_submit_button("🚀 Complete Setup & Start Learning")
        if submitted:
            if not name.strip():
                st.error("Please enter your name.")
            else:
                subs = [s.strip() for s in subjects_raw.split(",") if s.strip()]
                st.session_state.profile = {
                    "name": name,
                    "grade": grade,
                    "email": email,
                    "weekly_goal": weekly_target_hours,
                    "subjects": subs,
                }
                st.session_state.xp += 50
                st.success("Profile created! +50 XP awarded.")
                st.rerun()
    st.stop()

# ------------------------------------------------------------------------------
# 5. TAB: Dashboard
# ------------------------------------------------------------------------------
if menu == "🏠 Dashboard":
    p = st.session_state.profile
    st.title(f"Welcome back, {p['name']}! 👋")
    st.caption(f"{p['grade']} • Level {1 + st.session_state.xp // 100} Scholar • {st.session_state.xp} XP")

    total_study_mins = sum(log["minutes"] for log in st.session_state.study_logs)
    hours_studied = round(total_study_mins / 60, 1)

    c1, c2, c3 = st.columns(3)
    c1.metric("Weekly Target", f"{p['weekly_goal']} hrs")
    c2.metric("Hours Studied", f"{hours_studied} hrs", delta=f"{round((hours_studied / p['weekly_goal']) * 100)}% of goal")
    c3.metric("XP Points", f"{st.session_state.xp} XP", delta="Keep going!")

    st.progress(min(1.0, hours_studied / max(1, p['weekly_goal'])))

    st.subheader("📌 Upcoming Exams & Deadlines")
    if not st.session_state.exams:
        st.info("No upcoming exams added yet. Go to the 'Exam Schedule' tab to add your first deadline!")
    else:
        for ex in sorted(st.session_state.exams, key=lambda x: x["date"]):
            days_left = (datetime.strptime(ex["date"], "%Y-%m-%d").date() - date.today()).days
            st.write(f"• **{ex['subject']}** — *{ex['title']}* on `{ex['date']}` ({days_left} days left)")

# ------------------------------------------------------------------------------
# 6. TAB: Socratic AI Tutor (Anti-Cheating Guardrails)
# ------------------------------------------------------------------------------
elif menu == "🤖 Socratic AI Tutor":
    st.title("🤖 Socratic AI Tutor")
    st.info("💡 **Rule**: The tutor guides your thinking through hints and questions. It will **never** give you direct homework answers!")

    # Subject Selector
    subj = st.selectbox("Subject Focus", st.session_state.profile["subjects"])

    # Render previous messages
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_input = st.chat_input("Ask a question about a concept or problem...")

    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        SOCRATIC_PROMPT = f"""
You are StudyPulse's Socratic AI Tutor for a student in {st.session_state.profile['grade']} studying {subj}.
CRITICAL PEDAGOGICAL POLICY:
1. NEVER provide the direct answer to homework questions, test problems, or math equations.
2. Guide the student step-by-step using the Socratic method: ask probing questions, give small conceptual hints, and encourage critical thinking.
3. Keep your language simple, clear, encouraging, and age-appropriate for Grade 8 and 9.
4. If the student asks 'What is the answer?', gently decline and ask them what step they have tried so far.
"""
        with st.chat_message("assistant"):
            with st.spinner("Guiding your thoughts..."):
                reply = call_gemini(SOCRATIC_PROMPT, user_input, api_key_input)
                st.markdown(reply)
                st.session_state.chat_history.append({"role": "assistant", "content": reply})
                st.session_state.xp += 10

# ------------------------------------------------------------------------------
# 7. TAB: Revision Kit Generator (Flashcards & Quizzes)
# ------------------------------------------------------------------------------
elif menu == "📝 Revision Kit Generator":
    st.title("📝 AI Revision Kit Generator")
    st.caption("Paste your textbook notes or topics to generate flashcards and multiple-choice quizzes.")

    topic_subject = st.selectbox("Subject", st.session_state.profile["subjects"])
    notes_input = st.text_area(
        "Notes or Topic Content",
        placeholder="Paste your study notes or chapter summary here...",
        height=180
    )

    colA, colB = st.columns(2)
    with colA:
        if st.button("🗂️ Generate Flashcards", use_container_width=True):
            if not notes_input.strip():
                st.warning("Please enter some notes first.")
            else:
                prompt = f"""
Analyze the student's study material and create 4-6 high quality flashcards.
Output ONLY valid JSON formatted as:
[
  {{"front": "Concept or Question", "back": "Clear concise explanation"}}
]
Content:
{notes_input}
"""
                with st.spinner("Generating flashcards..."):
                    raw = call_gemini("You are an educational study aid generator. Output valid JSON only.", prompt, api_key_input)
                    try:
                        clean = raw.replace("```json", "").replace("```", "").strip()
                        cards = json.loads(clean)
                        st.session_state.flashcards = cards
                        st.session_state.xp += 25
                        st.success("Flashcards ready! +25 XP")
                    except Exception:
                        st.markdown(raw)

    with colB:
        if st.button("❓ Generate Practice Quiz", use_container_width=True):
            if not notes_input.strip():
                st.warning("Please enter some notes first.")
            else:
                prompt = f"""
Create 3 multiple choice questions for a Grade 8/9 student based on this text.
Output ONLY valid JSON formatted as:
[
  {{
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer_index": 0,
    "hint": "Helpful hint without giving it away",
    "explanation": "Why this is correct"
  }}
]
Content:
{notes_input}
"""
                with st.spinner("Generating quiz..."):
                    raw = call_gemini("You are a quiz master. Output valid JSON only.", prompt, api_key_input)
                    try:
                        clean = raw.replace("```json", "").replace("```", "").strip()
                        quiz = json.loads(clean)
                        st.session_state.quiz_questions = quiz
                        st.session_state.xp += 30
                        st.success("Quiz generated! +30 XP")
                    except Exception:
                        st.markdown(raw)

    # Display Flashcards
    if st.session_state.flashcards:
        st.subheader("🗂️ Your Generated Flashcards")
        for i, card in enumerate(st.session_state.flashcards, 1):
            with st.expander(f"Card {i}: {card.get('front', '')}"):
                st.write(f"**Answer:** {card.get('back', '')}")

    # Display Quiz
    if st.session_state.quiz_questions:
        st.subheader("❓ Practice Quiz")
        for i, q in enumerate(st.session_state.quiz_questions, 1):
            st.markdown(f"**Q{i}. {q['question']}**")
            choice = st.radio(f"Select your answer for Q{i}:", q["options"], key=f"q_{i}")
            with st.expander("Need a hint?"):
                st.caption(f"💡 {q.get('hint', 'Think carefully about the key definitions.')}")
            if st.button(f"Check Answer Q{i}", key=f"btn_{i}"):
                idx = q["options"].index(choice)
                if idx == q["answer_index"]:
                    st.success(f"🎉 Correct! {q.get('explanation', '')}")
                    st.session_state.xp += 15
                else:
                    st.error(f"Not quite. {q.get('explanation', '')}")

# ------------------------------------------------------------------------------
# 8. TAB: Study Session Timer
# ------------------------------------------------------------------------------
elif menu == "⏱️ Study Timer":
    st.title("⏱️ Pomodoro Focus Timer")
    
    col1, col2 = st.columns(2)
    with col1:
        timer_subject = st.selectbox("Subject to Study", st.session_state.profile["subjects"])
    with col2:
        study_mins = st.slider("Focus Duration (Minutes)", min_value=1, max_value=60, value=25)

    if st.button("▶️ Start Focus Session"):
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        total_seconds = study_mins * 60
        for sec in range(total_seconds):
            mins_left = (total_seconds - sec) // 60
            secs_left = (total_seconds - sec) % 60
            status_text.markdown(f"### ⏳ Time Remaining: `{mins_left:02d}:{secs_left:02d}`")
            progress_bar.progress((sec + 1) / total_seconds)
            time.sleep(1) # Simulated timer
            
        st.balloons()
        st.success(f"Great focus! You completed {study_mins} minutes on {timer_subject}.")
        st.session_state.study_logs.append({
            "subject": timer_subject,
            "minutes": study_mins,
            "date": str(date.today())
        })
        st.session_state.xp += study_mins * 2
        st.info(f"Earned +{study_mins * 2} XP!")

# ------------------------------------------------------------------------------
# 9. TAB: Exam Schedule & Deadlines
# ------------------------------------------------------------------------------
elif menu == "📅 Exam Schedule":
    st.title("📅 Exam & Assessment Deadlines")

    with st.form("add_exam_form"):
        col1, col2 = st.columns(2)
        with col1:
            ex_subj = st.selectbox("Subject", st.session_state.profile["subjects"])
            ex_title = st.text_input("Exam Name / Topic", placeholder="e.g. Midterm Chapter 1-4")
        with col2:
            ex_date = st.date_input("Exam Date")
            ex_target = st.text_input("Target Score / Goal", placeholder="e.g. 90% or Grade A")

        if st.form_submit_button("➕ Add Exam to Schedule"):
            st.session_state.exams.append({
                "subject": ex_subj,
                "title": ex_title,
                "date": str(ex_date),
                "target": ex_target
            })
            st.success(f"Added {ex_title} on {ex_date}!")
            st.rerun()

    st.subheader("Your Upcoming Tests")
    if not st.session_state.exams:
        st.info("No exams added yet.")
    else:
        for ex in st.session_state.exams:
            d_left = (datetime.strptime(ex["date"], "%Y-%m-%d").date() - date.today()).days
            st.markdown(f"📅 **{ex['subject']}**: {ex['title']} — `{ex['date']}` (**{d_left} days remaining**)")

# ------------------------------------------------------------------------------
# 10. TAB: Gamification & Badges
# ------------------------------------------------------------------------------
elif menu == "🏆 Progress & Badges":
    st.title("🏆 Milestones & Achievements")
    st.metric("Total Experience Points (XP)", f"{st.session_state.xp} XP")

    badges = [
        {"name": "🌱 First Step", "desc": "Completed profile onboarding", "unlocked": st.session_state.xp >= 50},
        {"name": "🧠 Curious Mind", "desc": "Chatted with Socratic AI Tutor", "unlocked": st.session_state.xp >= 60},
        {"name": "🗂️ Card Master", "desc": "Generated personalized flashcards", "unlocked": st.session_state.xp >= 80},
        {"name": "⏱️ Deep Focus", "desc": "Logged a study session", "unlocked": len(st.session_state.study_logs) > 0},
        {"name": "🌟 Study Champion", "desc": "Accumulated over 200 XP", "unlocked": st.session_state.xp >= 200},
    ]

    cols = st.columns(len(badges))
    for col, badge in zip(cols, badges):
        with col:
            if badge["unlocked"]:
                st.success(f"**{badge['name']}**\n\n{badge['desc']}\n\n✅ *Unlocked*")
            else:
                st.warning(f"**{badge['name']}**\n\n{badge['desc']}\n\n🔒 *Locked*")
