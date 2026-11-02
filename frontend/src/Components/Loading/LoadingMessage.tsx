import Box from '@mui/material/Box';
import React from 'react';

const messages = [
  'Downloading more RAM',
  'Now in Technicolor',
  'Previously on Whisparr...',
  'Bleep Bloop.',
  'Locating the required gigapixels to render...',
  'Spinning up the hamster wheel...',
  "At least you're not on hold",
  'Hum something loud while others stare',
  'Loading humorous message... Please Wait',
  "I could've been faster in Python",
  "Don't forget to rewind your episodes",
  'Congratulations! You are the 1000th visitor.',
  "HELP! I'm being held hostage and forced to write these stupid lines!",
  'RE-calibrating the internet...',
  "I'll be here all week",
  "Don't forget to tip your waitress",
  'Apply directly to the forehead',
  'Loading Battlestation',
];

let message: string | null = null;

function LoadingMessage() {
  if (!message) {
    const index = Math.floor(Math.random() * messages.length);
    message = messages[index];
  }

  return (
    <Box
      sx={{
        m: '10px 10px 0',
        textAlign: 'center',
        fontWeight: 300,
        fontSize: 36,
      }}
    >
      {message}
    </Box>
  );
}

export default LoadingMessage;
