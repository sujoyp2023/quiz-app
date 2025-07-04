import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

const QuizApp = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [users] = useState([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user1', password: 'user123', role: 'user' },
    { id: 3, username: 'user2', password: 'user123', role: 'user' }
  ]);

  const [quizzes, setQuizzes] = useState(() => {
    const stored = localStorage.getItem('quizzes');
    return stored ? JSON.parse(stored) : [];
  });

  const [userQuizResults, setUserQuizResults] = useState(() => {
    const stored = localStorage.getItem('userQuizResults');
    return stored ? JSON.parse(stored) : {};
  });

  const [currentView, setCurrentView] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      return user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
    }
    return 'login';
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [newQuizTopic, setNewQuizTopic] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('userQuizResults', JSON.stringify(userQuizResults));
  }, [userQuizResults]);

  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('login');
    setLoginForm({ username: '', password: '' });
    setSelectedQuiz(null);
    setQuizAnswers([]);
    setShowResults(false);
    setChatMessages([]);
  };

  const hasUserAttempted = (quizId) => {
    const attempts = userQuizResults[currentUser.id] || [];
    return attempts.some(res => res.quizId === quizId);
  };

  const startQuiz = (quiz) => {
    if (hasUserAttempted(quiz.id)) {
      alert('You have already attempted this quiz.');
      return;
    }
    setSelectedQuiz(quiz);
    setQuizAnswers(Array(quiz.questions.length).fill(null));
    setCurrentView('quiz');
  };

  const submitQuiz = () => {
    const score = quizAnswers.filter((answer, i) => answer === selectedQuiz.questions[i].correct).length;
    const result = { quizId: selectedQuiz.id, score, total: selectedQuiz.questions.length };
    setUserQuizResults(prev => ({
      ...prev,
      [currentUser.id]: [...(prev[currentUser.id] || []), result]
    }));
    setShowResults(true);
  };

  const fetchQuizzesFromDB = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/questions");
      const dbQuestions = await response.json();

      const formattedQuiz = {
        id: Date.now(),
        title: "General Knowledge Quiz",
        description: "Fetched from PostgreSQL DB",
        tags: ["general"],
        questions: dbQuestions.map((q) => ({
          question: q.question_text,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correct: { A: 0, B: 1, C: 2, D: 3 }[q.correct_option],
        })),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      setQuizzes([formattedQuiz]);
      setNewQuizTopic('');
    } catch (err) {
      console.error("Error fetching from DB:", err);
      alert("Failed to load quizzes from DB");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const quizContext = selectedQuiz.questions.map((q, i) => ({
      question: q.question,
      userAnswer: q.options[quizAnswers[i]],
      correctAnswer: q.options[q.correct]
    }));
    const response = await fetch('/api/quizbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput, quizContext })
    });
    const { reply } = await response.json();
    setChatMessages(prev => [...prev, { role: 'bot', content: reply }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 text-gray-800">
      {currentView === "login" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">QuizMaster</h1>
            <p className="text-gray-800">Sign in to your account</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, username: e.target.value }))
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </button>
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm mb-2">Demo Accounts:</p>
            <p className="text-xs">Admin: admin / admin123</p>
            <p className="text-xs">User: user1 / user123</p>
          </div>
        </div>
      )}

      {currentView === "admin-dashboard" && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Load Quiz</h2>
            <button onClick={handleLogout} className="text-sm text-red-600">
              Logout
            </button>
          </div>
          <div className="flex mb-4 gap-2">
            <button
              onClick={fetchQuizzesFromDB}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Load from Database
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-2">Existing Quizzes</h3>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-4 border rounded-lg mb-2">
              <h4 className="font-semibold">{quiz.title}</h4>
              <p className="text-sm">{quiz.description}</p>
            </div>
          ))}
        </div>
      )}

      {currentView === "user-dashboard" && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Available Quizzes</h2>
            <button onClick={handleLogout} className="text-sm text-red-600">
              Logout
            </button>
          </div>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-4 border rounded-lg mb-4">
              <h3 className="text-lg font-semibold">{quiz.title}</h3>
              <p className="text-sm">{quiz.description}</p>
              <button
                onClick={() => startQuiz(quiz)}
                className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      )}

      {currentView === "quiz" && selectedQuiz && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">{selectedQuiz.title}</h2>
          {selectedQuiz.questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold mb-2">
                {i + 1}. {q.question}
              </p>
              {q.options.map((opt, idx) => (
                <label key={idx} className="block">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={quizAnswers[i] === idx}
                    onChange={() =>
                      setQuizAnswers((prev) =>
                        prev.map((a, j) => (j === i ? idx : a))
                      )
                    }
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button
            onClick={submitQuiz}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      )}

      {showResults && selectedQuiz && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          <p className="text-lg">
            You scored{" "}
            {
              quizAnswers.filter(
                (a, i) => a === selectedQuiz.questions[i].correct
              ).length
            }{" "}
            out of {selectedQuiz.questions.length}
          </p>
          <button
            onClick={() => {
              setCurrentView("user-dashboard");
              setShowResults(false);
              setSelectedQuiz(null);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizApp;
const fetchQuizzesFromDB = async () => {
  try {
    const response = await fetch("http://localhost:3002/api/questions");
const dbQuestions = await response.json();
console.log("Fetched questions:", dbQuestions); 


    const formattedQuiz = {
      id: Date.now(),
      title: "General Knowledge Quiz",
      description: "Fetched from PostgreSQL DB",
      tags: ["general"],
      questions: dbQuestions.map((q) => ({
        question: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correct: { A: 0, B: 1, C: 2, D: 3 }[q.correct_option],
      })),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setQuizzes([formattedQuiz]);
  } catch (err) {
    console.error("Fetch failed", err);
    alert("Unable to load quiz from database.");
  }
};
