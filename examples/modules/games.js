const { Markup } = require('telegraf');

const MODULE = 'Games';
const HELP = `
🎮 *Fun Games*

/dice - Roll a dice
Example: /dice

/rps [choice] - Play Rock, Paper, Scissors
Example: /rps rock

/guess [1-100] - Number guessing game
Example: /guess 50

/trivia - Start a trivia game
Example: /trivia

/word - Get a word to unscramble
Example: /word
`;

// Game state storage (in memory - use a database in production)
const gameState = new Map();

// Command implementations
const commands = {
    dice: async (ctx) => {
        const result = Math.floor(Math.random() * 6) + 1;
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        ctx.reply(`🎲 Rolling dice...\n${diceEmojis[result - 1]} You rolled a ${result}!`);
    },

    rps: async (ctx) => {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        const userChoice = ctx.message.text.split(' ')[1]?.toLowerCase();
        if (!choices.includes(userChoice)) {
            return ctx.reply('❌ Please choose rock, paper, or scissors\nExample: /rps rock');
        }

        const botChoice = choices[Math.floor(Math.random() * 3)];
        let result;

        if (userChoice === botChoice) {
            result = "It's a tie! 🤝";
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'You win! 🎉';
        } else {
            result = 'I win! 🤖';
        }

        ctx.reply(
            `You: ${emojis[userChoice]} ${userChoice}\n` +
            `Me: ${emojis[botChoice]} ${botChoice}\n\n` +
            result
        );
    },

    guess: async (ctx) => {
        const userId = ctx.from.id;
        const guess = parseInt(ctx.message.text.split(' ')[1]);

        if (!gameState.has(userId)) {
            // Start new game
            gameState.set(userId, {
                number: Math.floor(Math.random() * 100) + 1,
                attempts: 0
            });
            return ctx.reply('🎯 I\'ve thought of a number between 1 and 100. Try to guess it!\nExample: /guess 50');
        }

        const game = gameState.get(userId);
        
        if (!guess || guess < 1 || guess > 100) {
            return ctx.reply('❌ Please enter a valid number between 1 and 100');
        }

        game.attempts++;

        if (guess === game.number) {
            const result = `🎉 Congratulations! You guessed it in ${game.attempts} attempts!`;
            gameState.delete(userId);
            ctx.reply(result);
        } else {
            const hint = guess < game.number ? 'higher ⬆️' : 'lower ⬇️';
            ctx.reply(`Try ${hint}! (Attempt ${game.attempts})`);
        }
    },

    trivia: async (ctx) => {
        // Simple trivia questions (in production, use an API or database)
        const questions = [
            {
                q: 'What is the capital of France?',
                a: 'Paris',
                options: ['London', 'Paris', 'Berlin', 'Madrid']
            },
            {
                q: 'Which planet is known as the Red Planet?',
                a: 'Mars',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn']
            }
        ];

        const question = questions[Math.floor(Math.random() * questions.length)];
        const keyboard = Markup.inlineKeyboard(
            question.options.map(option => [
                Markup.button.callback(option, `trivia:${option}`)
            ])
        );

        ctx.reply(`🎯 *Trivia Question*\n\n${question.q}`, {
            parse_mode: 'Markdown',
            ...keyboard
        });
    },

    word: async (ctx) => {
        const words = ['javascript', 'telegram', 'bot', 'programming', 'computer'];
        const word = words[Math.floor(Math.random() * words.length)];
        
        // Scramble the word
        const scrambled = word
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        ctx.reply(
            '🔤 *Unscramble this word*:\n\n' +
            `\`${scrambled}\`\n\n` +
            'Use /answer [word] to submit your answer',
            { parse_mode: 'Markdown' }
        );

        // Store the word for checking the answer
        gameState.set(`word_${ctx.from.id}`, word);
    },

    answer: async (ctx) => {
        const userId = ctx.from.id;
        const word = gameState.get(`word_${userId}`);
        const answer = ctx.message.text.split(' ')[1]?.toLowerCase();

        if (!word) {
            return ctx.reply('❌ No active word game. Use /word to start a new game!');
        }

        if (!answer) {
            return ctx.reply('❌ Please provide your answer\nExample: /answer telegram');
        }

        if (answer === word) {
            ctx.reply('🎉 Correct! Well done!');
            gameState.delete(`word_${userId}`);
        } else {
            ctx.reply('❌ Wrong answer, try again!');
        }
    }
};

module.exports = { MODULE, HELP, commands };