import React, { useEffect, useRef, useState } from 'react';
import todo_icon from '../assets/todo_icon.png';
import Confetti from 'react-confetti'; // Import Confetti component
import tick from '../assets/tick.png';
import not_tick from '../assets/not_tick.png';
import delete_icon from '../assets/delete.png';

const Todo = () => {
  const [todoList, setTodoList] = useState(() => {
    const storedTodos = localStorage.getItem("todos");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const [xp, setXp] = useState(() => {
    const storedXp = localStorage.getItem("xp");
    return storedXp ? parseInt(storedXp, 10) : 0;
  });
  const [level, setLevel] = useState(() => {
    const storedLevel = localStorage.getItem("level");
    return storedLevel ? parseInt(storedLevel, 10) : 1;
  });
  const xpToNextLevel = 100; // XP required to level up
  const inputRef = useRef();
  const [isLevelUp, setIsLevelUp] = useState(false); // State for triggering confetti

  const add = () => {
    const inputText = inputRef.current.value.trim();
    if (inputText === "") return;

    const newTodo = {
      id: Date.now(),
      text: inputText,
      isComplete: false,
    };

    setTodoList((prev) => {
      const updatedTodos = [...prev, newTodo];
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      return updatedTodos;
    });

    inputRef.current.value = "";
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      add();
    }
  }

  const deleteTodo = (id) => {
    setTodoList((prevTodos) => {
      const updatedTodos = prevTodos.filter((todo) => todo.id !== id);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  }

  const toggle = (id) => {
    setTodoList((prevTodos) => {
      const updatedTodos = prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isComplete: !todo.isComplete } : todo
      );

      const toggledTodo = updatedTodos.find((todo) => todo.id === id);
      if (toggledTodo && toggledTodo.isComplete) {
        setXp((prevXp) => prevXp + 5); // Increment XP by 5 when task is marked as complete
      } else if (toggledTodo && !toggledTodo.isComplete && xp > 0) {
        setXp((prevXp) => Math.max(0, prevXp - 5)); // Decrease XP by 5, ensuring it never goes below zero
      }

      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      return updatedTodos;
    });
  }

  useEffect(() => {
    localStorage.setItem("xp", xp.toString());
    localStorage.setItem("level", level.toString());
  }, [xp, level]);

  useEffect(() => {
    if (xp >= xpToNextLevel) {
      setLevel((prevLevel) => prevLevel + 1);
      setXp(xp - xpToNextLevel);
      setIsLevelUp(true); // Trigger confetti animation
    }
  }, [xp]);

  return (
    <div style={{
      fontFamily: 'MedievalSharp, cursive',
      backgroundColor: '#f8f3e9',
      width: '95%',
      maxWidth: '600px',
      margin: 'auto',
      padding: '20px',
      minHeight: '550px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    }}>
      <div className='flex items-center mt-7 gap-2'>
        <img className='w-8' src={todo_icon} alt="Todo Icon" />
        <h1 className='text-3xl font-semibold'>Quest-Master</h1>
      </div>

      <div className='flex items-center my-7 bg-gray-200 rounded-full'>
        <input 
          ref={inputRef} 
          style={{
            background: 'transparent',
            border: '0',
            outline: 'none',
            flex: '1',
            height: '56px',
            paddingLeft: '20px',
            paddingRight: '10px',
            placeholder: 'text-slate-600'
          }}
          type="text" 
          placeholder='Add your daily Quest'
          onKeyDown={handleKeyDown}
        />
        <button onClick={add} className='border-none rounded-full bg-orange-500 w-32 h-14 text-white text-lg font-medium cursor-pointer hover:bg-orange-600'>ADD +</button>
      </div>

      <div>
        {todoList.map((item) => (
          <div key={item.id} className='flex items-center my-3 gap-2'>
            <div onClick={() => toggle(item.id)} className='flex flex-1 items-center cursor-pointer'>
              <img src={item.isComplete ? tick : not_tick} alt={item.isComplete ? 'Completed' : 'Not Completed'} className='w-7'/>
              <p className={`text-slate-700 ml-4 text-[17px] ${item.isComplete ? 'line-through' : ''}`}>{item.text}</p>
            </div>
            <img onClick={() => deleteTodo(item.id)} src={delete_icon} alt="Delete" className='w-3.5 cursor-pointer'/>
          </div>
        ))}
      </div>

      {/* XP Bar and Level Display */}
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        backgroundColor: 'white',
        padding: '10px',
        borderTop: '1px solid #ccc'
      }}>
        <div className="flex items-center">
          <div style={{
            background: 'linear-gradient(to right, #f48fb1, #f06292, #9575cd, #64b5f6, #4fc3f7, #4dd0e1, #4db6ac, #81c784, #aed581, #ff8a65, #ff7043)',
            borderRadius: '9999px',
            height: '10px',
            flex: '1',
            marginRight: '10px',
          }}>
            <div
              style={{
                background: '#81c784',
                borderRadius: '9999px',
                height: '100%',
                width: `${Math.min((xp / xpToNextLevel) * 100, 100)}%`
              }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">{`${xp}/${xpToNextLevel} XP`}</p>
          <p className="ml-3 text-gray-600 text-sm">Level {level}</p>
        </div>
      </div>

      {/* Confetti Effect on Level Up */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        {isLevelUp && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
            wind={0.1}
            colors={['#f44336', '#2196f3', '#ffeb3b', '#4caf50']}
          />
        )}
      </div>
    </div>
  );
}

export default Todo;
