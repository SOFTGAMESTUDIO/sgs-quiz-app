import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../../DataBase/firebaseConfig";
import Layout from "../../Components/Layout";

const DailyQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(fireDB, "Dailyquizzes"));
        const quizzesData = [];
        querySnapshot.forEach((doc) => {
          quizzesData.push({ id: doc.id, ...doc.data() });
        });
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      quizzes.forEach((quiz) => {
        const examTime = new Date(quiz.examPage).getTime();
        const now = new Date().getTime();
        const timeLeft = examTime - now;
  
        if (timeLeft <= 0) {
          updatedTimers[quiz.id] = "STARTED";
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          updatedTimers[quiz.id] = `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
        }
      });
      setTimers(updatedTimers);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [quizzes]);
  

  const handleOpenQuiz = (quiz) => {
    window.location.href = `/DailyQuiz/${quiz.id}`;
  };
  
  if (loading) {
    return <p className="text-center mt-10 text-gray-800">Loading exams...</p>;
  }

  if (quizzes.length === 0) {
    return (
        <Layout>
 <p className="text-center mt-10 h-screen justify-center items-center flex text-gray-800">
        No exams found.
      </p>
        </Layout>
     
    );
  }

  return (
    <Layout>
 <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Available Quizzes
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex justify-center">
                <img
                  src={quiz.imageUrl}
                  alt={quiz.name}
                  className="h-60 w-full object-contain object-center mb-6 rounded-lg"
                />
              </div>
              <h2 className="text-xs font-medium text-cyan-600 mb-2">
                Quiz
              </h2>
              <h1 className="text-lg font-semibold text-gray-800 mb-4">
                {quiz.name}
              </h1>
              <p className="text-xs text-gray-600 mb-4">
                Language: {quiz.language}
              </p>

              {/* Countdown or Start Button */}
              <div className="text-center mb-4">
                {timers[quiz.id] === "STARTED" ? (
                  <button
                    onClick={() => handleOpenQuiz(quiz)}
                    className="w-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-200"
                  >
                    Start Quiz
                  </button>
                ) : (
                  <button
                    className="w-full bg-gray-200 text-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 cursor-default"
                    disabled
                  >
                    {timers[quiz.id] || "Loading timer..."}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </Layout>
   
  );
};

export default DailyQuizList;