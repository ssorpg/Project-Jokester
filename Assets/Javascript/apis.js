// API List
var APIs = {
    giphyMemes: {
        url: 'http://api.giphy.com/v1/gifs/search?limit=10&api_key=3dEcVRH1SquXQ50csTRKQnxK8aTT0yxt&q=',
        name: 'Giphy Memes',
        selected: true,
        searchable: true
    },
    chuckNorrisJokes: {
        url: 'https://api.chucknorris.io/jokes/search?query=',
        name: 'Chuck Norris Jokes',
        selected: true,
        searchable: true
    },
    generalJokes: {
        url: 'https://sv443.net/jokeapi/category/Any',
        name: 'General Jokes',
        selected: true,
        searchable: false
    },
    // geekJokes: {
    //     url: 'https://geek-jokes.sameerkumar.website/api',
    //     name: 'Geek Memes',
    //     selected: true,
    //     searchable: false
    // },
    // corporateBS: {
    //     url: 'https://corporatebs-generator.sameerkumar.website',
    //     name: 'Corporate BS',
    //     selected: true,
    //     searchable: false
    // },
    ronSwansonQuotes: {
        url: 'https://ron-swanson-quotes.herokuapp.com/v2/quotes',
        name: 'Ron Swanson Quotes',
        selected: true,
        searchable: false
    },
    yoMommaJokes: {
        url: 'https://api.yomomma.info',
        name: 'Yo Momma Jokes',
        selected: true,
        searchable: false
    },
    dadJokes: {
        url: 'https://icanhazdadjoke.com/search?limit=10&term=',
        name: 'Dad Jokes',
        selected: true,
        searchable: true
    },
    // tronaldDumpQuotes: {
    //     url: 'https://api.tronalddump.io/search/quote?query=',
    //     name: 'Tronald Dump Quotes',
    //     selected: true,
    //     searchable: true
    // },
    xkcdComics: {
        url: 'https://relevant-xkcd-backend.herokuapp.com/search',
        name: 'XKCD Comics',
        selected: true,
        searchable: false
    }
};