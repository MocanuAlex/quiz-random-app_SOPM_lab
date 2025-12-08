import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { styles } from './styles';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Convertește codurile speciale HTML în text normal
const decodeHTML = (html) => {
  if (!html) return "";
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&eacute;/g, "é")
    .replace(/&aacute;/g, "á")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&uuml;/g, "ü")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
};

export default function App() {
  // ==========================================
  // 2. MEMORIA APLICAȚIEI (STATE)
  // ==========================================
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [newQ, setNewQ] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [bgColor, setBgColor] = useState('#e0e0e0');

  // ==========================================
  // 3. INITIALIZARE (DESCARCARE INTREBARI)
  // ==========================================
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10&category=15&difficulty=easy")
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map(q => {
          const decodedQuestion = decodeHTML(q.question);
          const decodedCorrectAnswer = decodeHTML(q.correct_answer);
          const decodedIncorrectAnswers = q.incorrect_answers.map(decodeHTML);

          const options = shuffle([...decodedIncorrectAnswers, decodedCorrectAnswer]);
          const correctAnswerIndex = options.indexOf(decodedCorrectAnswer);
          
          return { question: decodedQuestion, options, correctAnswerIndex, userAdded: false };
        });
        setQuizzes(shuffle(formatted));
      })
      .catch(err => console.error("Eroare API:", err));
  }, []);

  // ==========================================
  // 4. LOGICA JOCULUI (ACTIONS)
  // ==========================================
  const handleAnswer = (i, idx) => {
    if (answers[i] !== undefined) return;
    const correct = idx === quizzes[i].correctAnswerIndex;

    setBgColor(correct ? '#d4edda' : '#f8d7da');
    setTimeout(() => setBgColor('#e0e0e0'), 500);

    setScore(prev => correct ? prev + 10 : prev - 10);
    setAnswers(prev => ({ ...prev, [i]: idx }));
  };

  const handleReset = () => {
    setAnswers({});
    setScore(0);
    setQuizzes(prev => {
      const shuffled = prev.map(q => {
        const opts = shuffle(q.options);
        const correctVal = q.options[q.correctAnswerIndex];
        const newCorrectIndex = opts.indexOf(correctVal);
        return { ...q, options: opts, correctAnswerIndex: newCorrectIndex };
      });
      return shuffle(shuffled);
    });
  };

  const addQuestion = () => {
    if (!newQ.trim() || newOptions.some(o => !o.trim())) {
      Alert.alert("Eroare", "Completează toate câmpurile!");
      return;
    }
    const updated = [...quizzes, { question: newQ, options: newOptions, correctAnswerIndex: correctIndex, userAdded: true }];
    setQuizzes(updated);
    setNewQ(""); setNewOptions(["",""]); setCorrectIndex(0);
    Alert.alert("Succes", "Întrebare adăugată!");
  };

  const deleteQuestion = (i) => {
    const updated = quizzes.filter((_, idx) => idx !== i);
    setQuizzes(updated);
  };

  const updateOptionText = (text, index) => {
    const newOpts = [...newOptions];
    newOpts[index] = text;
    setNewOptions(newOpts);
  };

  const progress = quizzes.length ? Object.keys(answers).length / quizzes.length * 100 : 0;

  // ==========================================
  // 5. INTERFATA GRAFICA (RENDER UI)
  // ==========================================
  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* --- Header --- */}
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>Răspunsuri: {Object.keys(answers).length}/{quizzes.length} | Scor: {score}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.btnTextWhite}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {quizzes.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196f3" />
              <Text>Se încarcă întrebările...</Text>
            </View>
          ) : (
            // --- Lista de Intrebari ---
            quizzes.map((q, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionText}>{q.question}</Text>
                  {q.userAdded && (
                    <TouchableOpacity onPress={() => deleteQuestion(i)} style={styles.deleteBtn}>
                      <Text style={styles.btnTextWhite}>X</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.optionsList}>
                  {q.options.map((opt, idx) => {
                    let btnStyle = styles.optionBtn;
                    if (answers[i] !== undefined) {
                      if (idx === q.correctAnswerIndex) btnStyle = styles.optionBtnCorrect;
                      else if (idx === answers[i]) btnStyle = styles.optionBtnWrong;
                    }
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={btnStyle} 
                        onPress={() => handleAnswer(i, idx)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {/* --- Formular Adaugare --- */}
          <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Adaugă Întrebare</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Întrebarea ta..." 
              value={newQ} 
              onChangeText={setNewQ} 
            />
            {newOptions.map((opt, idx) => (
              <View key={idx} style={styles.optionRow}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder={`Varianta ${idx + 1}`} 
                  value={opt} 
                  onChangeText={(text) => updateOptionText(text, idx)} 
                />
                <TouchableOpacity 
                  style={[styles.radioBtn, correctIndex === idx && styles.radioBtnSelected]} 
                  onPress={() => setCorrectIndex(idx)}
                >
                  <Text style={styles.btnTextBlack}>Corect</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
              <Text style={styles.btnTextWhite}>Salvează Întrebarea</Text>
            </TouchableOpacity>
          </View>
          <View style={{height: 50}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}