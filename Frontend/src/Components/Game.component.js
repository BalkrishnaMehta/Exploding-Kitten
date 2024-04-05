import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { drawCard, setDefuseCounter, setModalContent, setCurrentCard } from './../redux/reducers';
import JSConfetti from 'js-confetti';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const client = new W3CWebSocket('ws://localhost:8080/ws');

function GameComponent(props) {
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const { card, defuseCounter, modalContent, currentCard } = useSelector((state) => state.GameComponent);
  const dispatch = useDispatch();
  const [leaderboardData, setLeaderboardData] = useState({});

  console.log('card Length:', card);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const leaderboardData = JSON.parse(message.data);
      console.log('Received leaderboard data:', leaderboardData);
      setLeaderboardData(leaderboardData);
    };

    return () => {
      client.close();
    };
  }, []);

  const fetchAndSetSavedGame = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/game?username=${username}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const savedGame = await response.json();
      console.log('Saved game:', savedGame);
      if (savedGame.deck.length !== 0 ){
        dispatch(drawCard(savedGame.deck.length));
      }
      dispatch(setDefuseCounter(savedGame.defuses));
      dispatch(setCurrentCard(null));
    } catch (error) {
      console.error('Error fetching saved game:', error.message);
    }
  };

  useEffect(() => {
    const username = document.getElementById('username').value;
    fetchAndSetSavedGame(username);
  }, []);

  const playAgain = async () => {
    try {
      const username = document.getElementById('username').value;
      if (!username) {
        throw new Error('Username is required');
      }
  
      const response = await fetch(`http://localhost:8080/start?username=${username}`, {
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const savedGame = await response.json();
      console.log('Saved game:', savedGame);
  
      dispatch(drawCard(savedGame.deck.length));
      dispatch(setDefuseCounter(savedGame.defuses));
      dispatch(setCurrentCard(null));
      document.getElementById('my_modal').close();
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleDrawCard = async () => {
    if(isTimeoutActive) return;

    try {
      const username = document.getElementById('username').value;
      if (!username) {
        throw new Error('Username is required');
      }
  
      const response = await fetch(`http://localhost:8080/draw?username=${username}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const drawnCard = await response.text();
      console.log('Drawn card:', drawnCard);
      dispatch(setCurrentCard(drawnCard));
  
      switch (drawnCard) {
        case 'cat':
          dispatch(drawCard(-1));
          break;
        case 'defuse':
          dispatch(drawCard(-1));
          dispatch(setDefuseCounter(defuseCounter + 1));
          break;
        case 'explodingkitten':
          if (defuseCounter > 0) {
            dispatch(drawCard(-1));
            dispatch(setDefuseCounter(defuseCounter - 1));
          } else {
            dispatch(setDefuseCounter(0));
            dispatch(setModalContent({
              title: 'Oops! 💥💣',
              message: 'You lost. Better luck next time.',
              buttonText: 'Try Again',
            }));
            document.getElementById('my_modal').showModal();
            return;
          }
          break;
        case 'shuffle':
          setIsTimeoutActive(true);
          setTimeout(() => {
            playAgain();
            setIsTimeoutActive(false);
          }, 2000);
          break;          
        default:
          break;
      }
  
      const updatedCard = card - 1;
      dispatch(drawCard(updatedCard));
      if (updatedCard === 0) {
        if (drawnCard !== 'shuffle') {
          try {
            const response = await fetch(`http://localhost:8080/increasePoints?username=${username}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
          } catch (error) {
            console.error('Error:', error.message);
          }
          
          dispatch(setDefuseCounter(0));
          const jsConfetti = new JSConfetti();
          jsConfetti.addConfetti();
      
          jsConfetti.addConfetti({
            emojis: ['🎊', '〽️', '🎉', '🪩'],
            emojiSize: 30,
            confettiNumber: 300,
          });
      
          dispatch(
            setModalContent({
              title: 'Hurray 🥳🥳🥳!',
              message: 'You Won. Point will be Added within short span of time',
              buttonText: 'Play Again',
            })
          );
          document.getElementById('my_modal').showModal();
        }
      }      
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div className='px-4'>
      <div className='flex flex-col items-center gap-4 cursor-default mb-4 sm:flex-row sm:justify-center sm:gap-8'>
        <label className='input input-bordered flex items-center gap-2'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' className='w-4 h-4 opacity-70'>
            <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z' />
          </svg>
          <input 
            type='text' 
            id='username' 
            className='grow' 
            placeholder='Player 1' 
            value={props.username} 
            onChange={(e) => props.setUsername(e.target.value)}  
          />

        </label>
        <div className='btn'>
          Defuse Bomb
          <div className='badge badge-primary'>{defuseCounter}</div>
        </div>
      </div>
      <div className='flex gap-4 justify-center'>
        <div onClick={handleDrawCard} className={`stack ${isTimeoutActive ? 'cursor-not-allowed' : ''}`}>
          {Array.from({ length: card }, (_, index) => (
            <img
              key={index}
              src='./Assets/Images/CardBack.jpg'
              alt={`Card ${index + 1}`}
              className={`filter grayscale h-80 w-65 rounded-lg`}
            />
          ))}
        </div>

        {currentCard && (
          <div key={card !== 0 ? 5 - card : 4} className="revealed-card animate-slideIn">
            <img src={`./Assets/Images/${currentCard}.jpg`} className="filter h-80 w-65 rounded-lg" alt="" />
          </div>
        )}
      </div>

      <div className='mt-8'>
        <h2 className='flex justify-center p-2 border-2'>Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(leaderboardData).map((username, index) => (
                <tr key={username}>
                  <th>{index + 1}</th>
                  <td>{username}</td>
                  <td>{leaderboardData[username]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      <dialog id='my_modal' className='modal modal-bottom sm:modal-middle'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>{modalContent.title}</h3>
          <p className='py-4'>{modalContent.message}</p>
          <button onClick={playAgain} className='btn btn-warning'>
            {modalContent.buttonText}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default GameComponent;