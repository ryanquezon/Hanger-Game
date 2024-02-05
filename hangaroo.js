const words = {
  easy: [
      { question: 'What is the capital of France', answer: 'PARIS' },
      { question: 'Who wrote Pride and Prejudice', answer: 'JANE AUSTEN' },
      { question: 'Largest planet in our solar system', answer: 'JUPITER' },
      { question: 'When was the United Nations founded', answer: 'POST WORLD WAR TWO' },
      { question: 'Chemical symbol for gold', answer: 'AU' },
      { question: 'Who painted the Mona Lisa', answer: 'DA VINCI' },
      { question: 'Tallest mountain in the world', answer: 'EVEREST' },
      { question: 'Author of Harry Potter', answer: 'JK ROWLING' },
      { question: 'Currency of Japan', answer: 'YEN' },
      { question: 'Distance between Earth and Sun', answer: 'NINETY THREE MILLION MILES' }
  ],
  difficult: [
      { question: 'What does HTML stand for', answer: 'HYPER TEXT MARKUP LANGUAGE' },
      { question: 'What is polymorphism in OOP', answer: 'MANY FORMS' },
      { question: 'Difference between a process and a thread', answer: 'INSTANCE VS PATH OF EXECUTION' },
      { question: 'Time complexity of binary search', answer: 'O LOG N' },
      { question: 'How does a relational database manage relationships', answer: 'FOREIGN KEYS' },
      { question: 'Purpose of a finally block', answer: 'EXECUTE IMPORTANT CODE' },
      { question: 'Concept of inheritance in OOP', answer: 'ACQUIRING PROPERTIES' },
      { question: 'Difference between == and === in JavaScript', answer: 'EQUALITY VS STRICT EQUALITY' },
      { question: 'How does garbage collection work in Java', answer: 'DELETES UNUSED OBJECTS' },
      { question: 'Difference between TCP and UDP', answer: 'CONNECTION ORIENTED VS CONNECTIONLESS' }
  ],
  expert: [
      { question: 'What is a closure in programming', answer: 'FUNCTION WITH ITS ENVIRONMENT' },
      { question: 'Concept of dynamic programming', answer: 'SOLVING SUBPROBLEMS' },
      { question: 'What is the CAP theorem', answer: 'CONSISTENCY AVAILABILITY PARTITION TOLERANCE' },
      { question: 'How does the B tree work', answer: 'SELF BALANCING SORTED DATA' },
      { question: 'Concept of lazy evaluation', answer: 'DELAYING EVALUATION' },
      { question: 'Role of a mutex', answer: 'SYNCHRONIZES ACCESS' },
      { question: 'How does MapReduce work', answer: 'PARALLEL DISTRIBUTED ALGORITHM' },
      { question: 'What is the SOLID principle', answer: 'DESIGN PRINCIPLES' },
      { question: 'How does public key cryptography work', answer: 'PAIRS OF KEYS' },
      { question: 'What is type inference', answer: 'AUTOMATIC TYPE DETECTION' }
  ],
  
};

let currentCategory = 'easy';
let currentQuestionIndex = 0;
let currentQuestion = words[currentCategory][currentQuestionIndex];
let incorrectGuesses = 0;
let score = 0;
let usedVowelClues = 0;
let usedConsonantClues = 0;

const questionElement = document.getElementById('question');
const clueElement = document.getElementById('clue');
const wordDisplayElement = document.getElementById('word-display');
const keyboardContainer = document.getElementById('keyboard-container');
const pointsElement = document.getElementById('points');
const clueButton = document.getElementById('clue-button');
const messageContainer = document.getElementById('message-container');
const incorrectGuessesContainer = document.getElementById('incorrect-guesses');
const backgroundMusic = document.getElementById('background-music');
const answerContainer = document.getElementById('answer-container');
const buzzSound = document.getElementById('buzz-sound');
const guessContainers = Array.from(incorrectGuessesContainer.children);


displayQuestion();

for (let i = 65; i <= 90; i++) {
  const letter = String.fromCharCode(i);
  const keyButton = document.createElement('div');
  keyButton.classList.add('key');
  keyButton.textContent = letter;
  keyButton.addEventListener('click', () => {
    handleGuess(letter);
    hideMessage(); 
  });
  keyboardContainer.appendChild(keyButton);
}
function updateKeyboardColors(letter) {
  const keyboardButtons = keyboardContainer.querySelectorAll('.key');
  keyboardButtons.forEach(button => {
    if (button.textContent === letter) {
      button.classList.add('correct-guess'); 
    }
  });
}


function displayQuestion() {
  currentQuestion = words[currentCategory][currentQuestionIndex];
  questionElement.textContent = `${currentCategory.toUpperCase()}: ${currentQuestion.question}`;

  const initialDisplay = currentQuestion.answer
    .split('')
    .map(char => (char === ' ' ? ' ' : '_'))
    .join('');
  wordDisplayElement.innerHTML = initialDisplay;

  keyboardContainer.innerHTML = '';
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const keyButton = document.createElement('div');
    keyButton.classList.add('key');
    keyButton.textContent = letter;
    keyButton.addEventListener('click', () => handleGuess(letter));
    keyboardContainer.appendChild(keyButton);
  }

  const categoryButtonsArray = Array.from(categoryButtons.children);
  categoryButtonsArray.forEach(button => {
    button.disabled = false;
  });
}

function showAnswer() {
  answerContainer.textContent = currentQuestion.answer;
  answerContainer.style.display = 'block';

  answerContainer.classList.add('pop-in');
  setTimeout(() => {
    answerContainer.classList.remove('pop-in');
    answerContainer.classList.add('pop-out');
    setTimeout(() => {
      answerContainer.style.display = 'none';
      answerContainer.classList.remove('pop-out');
    }, 500);
  }, 1000);
}


function updateWordDisplay(letter) {
  const wordArray = wordDisplayElement.textContent.split('');
  for (let i = 0; i < currentQuestion.answer.length; i++) {
    if (currentQuestion.answer[i] === letter || currentQuestion.answer[i] === ' ') {
      wordArray[i] = currentQuestion.answer[i];
    }
  }
  wordDisplayElement.textContent = wordArray.join('');
}
function nextQuestion() {
  showAnswer();
  usedVowelClues = 0;
  usedConsonantClues = 0;
  currentQuestionIndex++;
  if (currentQuestionIndex < words[currentCategory].length) {
    displayQuestion();
  } else {
    if (currentCategory === 'easy') {
      currentCategory = 'difficult';
    } else if (currentCategory === 'difficult') {
      currentCategory = 'expert';
    } else {
      endGame();
      return;
    }
    currentQuestionIndex = 0;
    displayQuestion();
  }
}

function showMessage(message) {
  const messageContainer = document.getElementById('message-container');
  if (messageContainer) {
    messageContainer.textContent = message;
  }
}


const MAX_CLUES = 3;
function useClue(clueType) {
  if (currentQuestionIndex < words[currentCategory].length && score >= 25 && usedClues < MAX_CLUES) {
    const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');

    if (unrevealedIndex !== -1) {
      let clue;
      if (clueType === 'vowel' && usedVowelClues <= 3) {
        clue = findVowelClue();
        usedVowelClues++;
      } else if (clueType === 'consonant' && usedConsonantClues <= 3) {
        clue = findConsonantClue();
        usedConsonantClues++;
      } else {
        showMessage(`You have already used the maximum number of ${clueType} clues.`);
        return;
      }

      if (clue !== '') {
        updateWordDisplay(clue);
        updateAnswer(clue);
        score -= 25;
        pointsElement.textContent = score;
        clueElement.textContent = `Clue: ${clue}`;
        clueElement.addEventListener('click', clearClue);
        usedClues++;
        updateClueButtons();
      } else {
        showMessage(`No ${clueType}s remaining in the word!`);
      }
    } else {
      showMessage("All letters are already revealed!");
    }

    if ((usedVowelClues === 3 && usedConsonantClues === 3) || usedClues === MAX_CLUES) {
      showMessage("You have used all 3 clues. Come back later on the next answer!");
      clueButton.disabled = true; 
    }
  } else {
    showMessage("You don't have enough points or have already used all clues");
  }
}



function checkMaxClues() {
  if (usedVowelClues === 3) {
    consonantButton.disabled = true;
    showMessage("Maximum use of vowel clues reached!");
  }

  if (usedConsonantClues === 3) {
    vowelButton.disabled = true;
    showMessage("Maximum use of consonant clues reached!");
  }
}

function disableVowelClueButton() {
  const vowelClueButton = document.getElementById('vowel-clue-button');
  if (vowelClueButton) {
    vowelClueButton.disabled = true;
  }
}

function disableConsonantClueButton() {
  const consonantClueButton = document.getElementById('consonant-clue-button');
  if (consonantClueButton) {
    consonantClueButton.disabled = true;
  }
}

function clearClue() {
  clueElement.textContent = '';
  clueElement.removeEventListener('click', clearClue);
}

function displayMessage(message) {
  messageContainer.textContent = message;
}
function hideMessage() {
  const messageContainer = document.getElementById('message-container');
  if (messageContainer) {
    messageContainer.textContent = '';
  }
}


function endGame() {
  const gameOverModal = document.getElementById('game-over-modal');
  const finalScoreElement = document.getElementById('final-score');

  finalScoreElement.textContent = score;
  gameOverModal.style.display = 'block';

  showAnswer();
}

function handleGuess(letter) {
  hideMessage();
  if (currentQuestion.answer.includes(letter)) {
    updateWordDisplay(letter);
    updateKeyboardColors(letter); 
    if (clueElement.textContent === `Clue: ${letter}`) {
      clearClue();
    }
  } else {
    incorrectGuesses++;
    if (incorrectGuesses <= 3) {
      updateIncorrectGuesses();
      playBuzzSound(); 

      if (incorrectGuesses === 1) {
        document.getElementById('damit1').style.display = 'none';
      } else if (incorrectGuesses === 2) {
        document.getElementById('damit').style.display = 'none';
      }
    }

    if (incorrectGuesses === 3) {
      endGame();
      return;
    }
    hideMessage();
  }

  if (wordDisplayElement.textContent === currentQuestion.answer) {
    score += 10;
    pointsElement.textContent = score;
    nextQuestion();
  }
}




function playBuzzSound() {
  if (buzzSound) {
    buzzSound.currentTime = 0; 
    buzzSound.play();
  }
}

function updateIncorrectGuesses() {
  guessContainers[incorrectGuesses - 1].textContent = 'X';
  guessContainers[incorrectGuesses - 1].classList.add('wrong');
}

function restartGame() {
  const gameOverModal = document.getElementById('game-over-modal');

  gameOverModal.style.display = 'none';

  currentCategory = 'easy';
  currentQuestionIndex = 0;
  incorrectGuesses = 0;
  score = 0;

  guessContainers.forEach(container => {
    container.textContent = '';
    container.classList.remove('wrong');
  });

  displayQuestion();
}

function closeGameOverModal() {
  const gameOverModal = document.getElementById('game-over-modal');
  gameOverModal.style.display = 'none';
}

function useButtonClue(clueType) {
  if (currentQuestionIndex < words[currentCategory].length && score >= 25) {
    const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');

    if (unrevealedIndex !== -1) {
      let clue;
      if ((clueType === 'vowel' && usedVowelClues < 3 && (usedVowelClues + usedConsonantClues) < 3) ||
          (clueType === 'consonant' && usedConsonantClues < 3 && (usedVowelClues + usedConsonantClues) < 3)) {
        if (clueType === 'vowel') {
          clue = findVowelClue();
          usedVowelClues++;
        } else {
          clue = findConsonantClue();
          usedConsonantClues++;
        }
      } else {
        showMessage(`You have already used the maximum number of clues.`);
        return;
      }

      if (clue !== '') {
        clueElement.textContent = `Clue: ${clue}`;
        score -= 25;
        pointsElement.textContent = score;

        clueElement.addEventListener('click', clearClue);
        updateClueButtons();
      } else {
        showMessage(`No ${clueType}s remaining in the word!`);
      }
    } else {
      showMessage("All letters are already revealed!");
    }

    if ((usedConsonantClues === 1 && usedVowelClues === 2) ||
        (usedConsonantClues === 2 && usedVowelClues === 1) ||
        (usedConsonantClues === 3) ||
        (usedVowelClues === 3)) {
      showMessage("You have reached the maximum number of clues. Both vowel and consonant buttons are now disabled.");
      vowelButton.disabled = true;
      consonantButton.disabled = true;
    }
  } else {
    showMessage("You don't have enough points!");
  }
}





function findVowelClue() {
  const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');
  for (let i = 0; i < currentQuestion.answer.length; i++) {
      const currentChar = currentQuestion.answer[i].toUpperCase();
      if (currentChar !== ' ' && 'AEIOU'.includes(currentChar) && currentQuestion.answer.includes(currentChar, unrevealedIndex) && wordDisplayElement.textContent[i] === '_') {
          return currentChar;
      }
  }
  return '';
}

function findConsonantClue() {
  const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');
  for (let i = 0; i < currentQuestion.answer.length; i++) {
      const currentChar = currentQuestion.answer[i].toUpperCase();
      if (currentChar !== ' ' && !'AEIOU'.includes(currentChar) && currentQuestion.answer.includes(currentChar, unrevealedIndex) && wordDisplayElement.textContent[i] === '_') {
          return currentChar;
      }
  }
  return '';
}

function findDifferentVowel(existingVowel) {
const vowels = ['A', 'E', 'I', 'O', 'U'];
const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');
for (let i = 0; i < vowels.length; i++) {
  if (vowels[i] !== existingVowel && currentQuestion.answer.includes(vowels[i], unrevealedIndex)) {
    return vowels[i];
  }
}
return '';
}

function findDifferentConsonant(existingConsonant) {
const unrevealedIndex = wordDisplayElement.textContent.indexOf('_');
for (let i = 0; i < currentQuestion.answer.length; i++) {
  const currentChar = currentQuestion.answer[i].toUpperCase();
  if (currentChar !== ' ' && currentChar !== 'A' && currentChar !== 'E' && currentChar !== 'I' && currentChar !== 'O' && currentChar !== 'U' && currentChar !== existingConsonant) {
    return currentChar;
  }
}
return '';
}


backgroundMusic.play();

function toggleBackgroundMusic() {
if (backgroundMusic.paused) {
  backgroundMusic.play();
} else {
  backgroundMusic.pause();
}
}
s

backgroundMusic.play();

function toggleBackgroundMusic() {
if (backgroundMusic.paused) {
  backgroundMusic.play();
} else {
  backgroundMusic.pause();
}
}
