import chatBotHuging as cb
import streamlit as st

st.title("Chat BOT")
st.write("Puedes hacerme a mi todas las preguntas")

if 'preguntas' not in st.session_state:
    st.session_state.preguntas = []
if 'respuestas' not in st.session_state:
    st.session_state.respuestas = []

def click():
    if st.session_state.user != '':
        pregunta = st.session_state.user
        respuesta = cb.consulta(pregunta)

        st.session_state.preguntas.append(pregunta)
        st.session_state.respuestas.append(respuesta)

        st.session_state.user = ''


with st.form('my-form'):
    st.text_input('¿En qué te puedo ayudar?', key='user', help='Escribe tu pregunta aquí')
    st.form_submit_button('Enviar', on_click=click)

if st.session_state.preguntas:
    st.markdown("### 🧠 Historial de conversación")
    for i in range(len(st.session_state.preguntas)-1, -1, -1):
        st.markdown(f"**Tú:** {st.session_state.preguntas[i]}")
        st.markdown(f"**Bot:** {st.session_state.respuestas[i]}")