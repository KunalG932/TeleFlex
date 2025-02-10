const { Markup } = require('telegraf');
const path = require('path');

const MODULE = 'Media';
const HELP = `
📸 *Media Commands*

/photo - Send a random photo
Example: /photo

/sticker - Get a random sticker
Example: /sticker

/gif - Search and send GIFs
Example: /gif cute cat

/album - Create a photo album
Example: /album

/media - Show all media assets
Example: /media
`;

// Define media assets for the module
const MEDIA = {
    photos: [
        {
            file: 'welcome.jpg',
            caption: '👋 Welcome to our bot!'
        },
        {
            file: 'features.jpg',
            caption: '✨ Check out our features!'
        }
    ],
    stickers: [
        'CAACAgIAAxkBAAEBPQZk_6_XH-yCVQn2W_kAAcOzAkxqAAOsAAM7YCQQa8zz_IZF',
        'CAACAgIAAxkBAAEBPQhk_6_Xt2kqI3dmX3pPjZ8K2Q4AAuwAA2AgJBBrzPP8hkU'
    ],
    gifs: [
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6a2F4Y...',
        'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6a2F4Y...'
    ],
    albumPhotos: [
        {
            file: 'album1.jpg',
            caption: 'Photo 1 of our album'
        },
        {
            file: 'album2.jpg',
            caption: 'Photo 2 of our album'
        },
        {
            file: 'album3.jpg',
            caption: 'Photo 3 of our album'
        }
    ]
};

// Command implementations
const commands = {
    photo: async (ctx) => {
        const photos = MEDIA.photos;
        const photo = photos[Math.floor(Math.random() * photos.length)];
        
        try {
            // In a real bot, you would use actual file paths
            const filePath = path.join(__dirname, '..', 'media', photo.file);
            await ctx.replyWithPhoto(
                { source: filePath },
                { caption: photo.caption }
            );
        } catch (error) {
            ctx.reply('📸 This would send a photo from our media assets!\n' +
                     'Add photos to your media directory and update the MEDIA.photos array.');
        }
    },

    sticker: async (ctx) => {
        const stickers = MEDIA.stickers;
        const sticker = stickers[Math.floor(Math.random() * stickers.length)];
        
        try {
            await ctx.replyWithSticker(sticker);
        } catch (error) {
            ctx.reply('🎨 This would send a sticker!\n' +
                     'Add your sticker file IDs to the MEDIA.stickers array.');
        }
    },

    gif: async (ctx) => {
        const query = ctx.message.text.split(' ').slice(1).join(' ');
        if (!query) {
            return ctx.reply('❌ Please provide a search term\nExample: /gif cute cat');
        }

        // In a real bot, you would integrate with Giphy or Tenor API
        ctx.reply('🎥 This would search and send a GIF matching: ' + query + '\n' +
                 'Integrate with Giphy or Tenor API and use the MEDIA.gifs array.');
    },

    album: async (ctx) => {
        const albumPhotos = MEDIA.albumPhotos;
        
        try {
            // In a real bot, you would use actual file paths
            const mediaGroup = albumPhotos.map(photo => ({
                type: 'photo',
                media: path.join(__dirname, '..', 'media', photo.file),
                caption: photo.caption
            }));

            await ctx.replyWithMediaGroup(mediaGroup);
        } catch (error) {
            ctx.reply('📸 This would send a photo album!\n' +
                     'Add photos to your media directory and update the MEDIA.albumPhotos array.');
        }
    },

    media: async (ctx) => {
        const mediaInfo = 
            '*📸 Available Media Assets*\n\n' +
            `Photos: ${MEDIA.photos.length}\n` +
            `Stickers: ${MEDIA.stickers.length}\n` +
            `GIFs: ${MEDIA.gifs.length}\n` +
            `Album Photos: ${MEDIA.albumPhotos.length}\n\n` +
            'Use the commands above to interact with media!';

        ctx.reply(mediaInfo, { parse_mode: 'Markdown' });
    }
};

module.exports = { MODULE, HELP, commands, MEDIA };