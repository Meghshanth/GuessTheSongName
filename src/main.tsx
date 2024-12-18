// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

const musicData = {
  artists: [
    {
      name: "Ed Sheeran",
      albums: [
        {
          name: "÷ (Deluxe)",
          songs: [
            { name: "Eraser" },
            { name: "Castle on the Hill" },
            { name: "Shape of You" },
            { name: "Perfect" }
          ]
        },
        {
          name: "x (Deluxe Edition)",
          songs: [
            { name: "One" },
            { name: "I'm a Mess" },
            { name: "Photograph" },
            { name: "Thinking Out Loud" }
          ]
        }
      ]
    },
    {
      name: "Taylor Swift",
      albums: [
        {
          name: "1989",
          songs: [
            { name: "Shake It Off" },
            { name: "Blank Space" },
            { name: "Style" },
            { name: "Wildest Dreams" }
          ]
        },
        {
          name: "Lover",
          songs: [
            { name: "Lover" },
            { name: "You Need to Calm Down" },
            { name: "The Archer" },
            { name: "Me!" }
          ]
        }
      ]
    },
    {
      name: "Dua Lipa",
      albums: [
        {
          name: "Future Nostalgia",
          songs: [
            { name: "Don't Start Now" },
            { name: "Levitating" },
            { name: "Physical" },
            { name: "Break My Heart" }
          ]
        },
        {
          name: "Dua Lipa",
          songs: [
            { name: "New Rules" },
            { name: "IDGAF" },
            { name: "Be the One" },
            { name: "Hotter Than Hell" }
          ]
        }
      ]
    },
    {
      name: "The Weeknd",
      albums: [
        {
          name: "After Hours",
          songs: [
            { name: "Blinding Lights" },
            { name: "Save Your Tears" },
            { name: "Heartless" },
            { name: "In Your Eyes" }
          ]
        },
        {
          name: "Starboy",
          songs: [
            { name: "Starboy" },
            { name: "I Feel It Coming" },
            { name: "Party Monster" },
            { name: "Die For You" }
          ]
        }
      ]
    },
    {
      name: "Charlie Puth",
      albums: [
        {
          name: "Voicenotes",
          songs: [
            { name: "Attention" },
            { name: "How Long" },
            { name: "Done for Me" },
            { name: "The Way I Am" }
          ]
        },
        {
          name: "Nine Track Mind",
          songs: [
            { name: "One Call Away" },
            { name: "We Don't Talk Anymore" },
            { name: "Marvin Gaye" },
            { name: "Dangerously" }
          ]
        }
      ]
    },
    {
      name: "Lady Gaga",
      albums: [
        {
          name: "Chromatica",
          songs: [
            { name: "Stupid Love" },
            { name: "Rain on Me" },
            { name: "911" },
            { name: "Sour Candy" }
          ]
        },
        {
          name: "The Fame",
          songs: [
            { name: "Just Dance" },
            { name: "Poker Face" },
            { name: "Paparazzi" },
            { name: "LoveGame" }
          ]
        }
      ]
    }
  ]
};


function partiallyDisplaySongName(songName: string): string {
  const words = songName.split(' ');
  const allLetters = songName.replace(/\s/g, '').toLowerCase();

  if (words.length > 1) {
    // For multi-word song names, show two random letters
    const randomChar1 = allLetters[Math.floor(Math.random() * allLetters.length)];
    let randomChar2 = randomChar1;
    while (randomChar2 === randomChar1) {
      randomChar2 = allLetters[Math.floor(Math.random() * allLetters.length)];
    }

    return words.map(word => {
      return word.split('').map(letter =>
          letter.toLowerCase() === randomChar1.toLowerCase() || letter.toLowerCase() === randomChar2.toLowerCase() ? letter : '-'
      ).join('');
    }).join(' ');
  } else {
    // For single-word song names, show one random letter
    const randomChar = allLetters[Math.floor(Math.random() * allLetters.length)];

    return songName.split('').map(letter =>
        letter.toLowerCase() === randomChar.toLowerCase() ? letter : '-'
    ).join('');
  }
}

// Add a post type definition
Devvit.addCustomPostType({
  name: 'MusicGuessingGame',
  render: (context) => {
    const { useState, useForm } = context;
    const [currentState, setCurrentState] = useState('initial');
    const [randomSong, setRandomSong] = useState('');
    const [partialSongName, setPartialSongName] = useState('');
    const [currentArtist, setCurrentArtist] = useState('');
    const [currentAlbum, setCurrentAlbum] = useState('');
    const [showClue, setShowClue] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [gameResult, setGameResult] = useState('');
    const selectRandomSong = () => {
      if (musicData.artists.length > 0) {
        const randomArtistIndex = Math.floor(Math.random() * musicData.artists.length);
        const selectedArtist = musicData.artists[randomArtistIndex];
        setCurrentArtist(selectedArtist.name);
        if (selectedArtist.albums.length > 0) {
          const randomAlbumIndex = Math.floor(Math.random() * selectedArtist.albums.length);
          const selectedAlbum = selectedArtist.albums[randomAlbumIndex];
          setCurrentAlbum(selectedAlbum.name);

          if (selectedAlbum.songs.length > 0) {
            const randomSongIndex = Math.floor(Math.random() * selectedAlbum.songs.length);
            const selectedSong = selectedAlbum.songs[randomSongIndex].name;
            setRandomSong(selectedSong);
            setPartialSongName(partiallyDisplaySongName(selectedSong));
          }
        }
      }
      setShowClue(false);
      setAttempts(0);
      setGameResult('');
    };

    const handleGuess = async (guess: string) => {
      if (guess.toLowerCase() === randomSong.toLowerCase()) {
        const points = showClue ? 2 : 5;
        setScore(prevScore => prevScore + points);
        setGameResult('correct');

        if (context.userId) {
          try {
            await context.redis.zIncrBy('game_scores', context.userId, points);
            console.log(`Score updated for user ${context.userId}: +${points}`);
          } catch (error) {
            console.error('Error updating score:', error);
          }
        }
      } else {
        setAttempts(prevAttempts => prevAttempts + 1);
        if (attempts >= 2) {
          setGameResult('incorrect');
        }
      }
    };

    const guessForm = useForm(
        {
          fields: [
            { name: 'guess', label: 'Your guess', type: 'string' }
          ],
        },
        (values: { guess?: string }) => {
          if (values.guess) {
            handleGuess(values.guess);
          }
        }
    );

    const BackButton = () => (
        <hstack width="100%" padding="small">
          <button
              onPress={() => setCurrentState('initial')}
              appearance="secondary"
              size="small"
          >
            Back
          </button>
        </hstack>
    );

    const renderInitialState = () => (
        <vstack gap="medium" alignment="center middle">
          <text size="xlarge">Welcome to the Music Guessing Game!</text>
          <button onPress={() => {
            setCurrentState('game');
            selectRandomSong();
          }}>Start Game</button>
          <button onPress={() => setCurrentState('yourScore')}>Your Score</button>
          <button onPress={() => setCurrentState('about')}>About Game</button>
        </vstack>
    );

    const renderGameState = () => (
        <vstack width="100%">
          <BackButton />
          <vstack gap="medium" alignment="center middle">
            <text size="large">Guess the Song!</text>
            <text size="large">{partialSongName}</text>
            <text>Album: {currentAlbum}</text>
            {!showClue && (
                <button onPress={() => setShowClue(true)} disabled={showClue}>
                  Show Clue
                </button>
            )}
            {showClue && <text>Artist: {currentArtist}</text>}
            <button onPress={() => context.ui.showForm(guessForm)}>Make a guess</button>
            <text>Attempts: {attempts}/3</text>
          </vstack>
        </vstack>
    );
    const renderResultState = () => (
        <vstack width="100%">
          <BackButton />
          <vstack gap="medium" alignment="center middle">
            <text size="xlarge">
              {gameResult === 'correct' ? 'Congratulations!' : 'Sorry, you could not get it right.'}
            </text>
            <text>The song was: {randomSong}</text>
            <text>Artist: {currentArtist}</text>
            <text>Album: {currentAlbum}</text>
            <button onPress={() => {
              selectRandomSong();
              setCurrentState('game');
            }}>
              New Game
            </button>
          </vstack>
        </vstack>
    );

    const renderYourScoreState = () => {
      return (
          <vstack width="100%">
            <BackButton />
            <vstack gap="medium" alignment="center middle">
              <text size="large">Your Score</text>
              <text>{score}</text>
            </vstack>
          </vstack>
      );
    };

    const renderAboutState = () => (
        <vstack width="100%">
          <BackButton />
          <vstack gap="medium" alignment="center middle">
            <text size="large">About the Music Guessing Game</text>
            <text>Try to guess the song from a partial name. The faster you guess, the more points you earn!</text>
          </vstack>
        </vstack>
    );

    switch (currentState) {
      case 'game':
        return gameResult ? renderResultState() : renderGameState();
      case 'yourScore':
        return renderYourScoreState();
      case 'about':
        return renderAboutState();
      default:
        return renderInitialState();
    }
  },
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add Music Guessing Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();

    try {
      const post = await reddit.submitPost({
        title: 'Music Guessing Game',
        subredditName: subreddit.name,
        preview: (
            <vstack height="100%" width="100%" alignment="middle center">
              <text>Loading Music Guessing Game...</text>
            </vstack>
        ),
      });

      await post.sticky();
      ui.showToast('Music Guessing Game post created and pinned successfully!');
    } catch (error) {
      console.error('Error creating Game post:', error);
      ui.showToast('Failed to create Music Guessing Game post');
    }
  },
});

export default Devvit;
