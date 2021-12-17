const socket = io('http://localhost:8000');

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp')
const messageContainer = document.querySelector(".container")
const voiceoutput = document.getElementById('audioOutput');
var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');
var noteContent = '';
var audio = new Audio('ting.mp3');

// Function which will append event info to the contaner
const append = (message, position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position =='left'){ 
        audio.play();
    }
}


// Ask new user for his/her name and let the server know
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// If a new user joins, receive his/her name from the server
socket.on('user-joined', name =>{
    append(`${name} joined the chat`, 'right')
})

// If server sends a message, receive it
socket.on('receive', data =>{
    if(voiceoutput.checked)
    {
        readOutLoud(data.name+"has send the message"+data.message) 
    }
    append(`${data.name}: ${data.message}`, 'left')
})
//erase function of textbox
function eraseText() {
  document.getElementById("note-textarea").value = "";
}


// If a user leaves the chat, append the info to the container
socket.on('left', name =>{
    append(`${name} left the chat`, 'right')
})

// If the form gets submitted, send server the message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''
})

 // speech recognisation innitialization
try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
  }
  catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    $('.app').hide();
  }
  /*Voice Recognition*/
  recognition.continuous = true;
  recognition.onresult = function(event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
  
    if(!mobileRepeatBug) {
      noteContent += transcript;
      noteTextarea.val(noteContent);
    }
  };
  
  recognition.onstart = function() { 
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
  }
  
  recognition.onspeechend = function() {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
  }
  
  recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
      instructions.text('No speech was detected. Try again.');  
    };
  }
  //function of audiochat function
  $('#start-record-btn').on('click', function(e) {
    alert("recorded message will be temporarily stored in textarea so on can edit it in case of unclear recording ");
    if (noteContent.length) {
      noteContent += ' ';
    }
    recognition.start();
  });
  
  
  $('#pause-record-btn').on('click', function(e) {
      alert("conform message on textbox and submit");
    recognition.stop();
    instructions.text('Voice recognition paused.');
    messageInput.value=noteContent;
  });
  
  noteTextarea.on('input', function() {
    noteContent = $(this).val();
  })
    // text to sppech function
     function readOutLoud(message) {
         var speech = new SpeechSynthesisUtterance();
         speech.text = message;
         speech.volume = 1;
         speech.rate = 1;
         speech.pitch = 1;
    
         window.speechSynthesis.speak(speech);
     }
  