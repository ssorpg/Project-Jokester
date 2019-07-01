// GLOBALS
// Static

// Firebase
const firebaseConfig = { // Use this or registering users and saving lastSearch + selectedAPIs
    apiKey: "AIzaSyCte7lhLlrSr3m3turhqLQQy3_3YSBymWE",
    authDomain: "trilogy-r-p-s.firebaseapp.com",
    databaseURL: "https://trilogy-r-p-s.firebaseio.com",
    projectId: "trilogy-r-p-s",
    storageBucket: "trilogy-r-p-s.appspot.com",
    messagingSenderId: "545722149214",
    appId: "1:545722149214:web:633cee7329b7a2af"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// APIs
const APIs = { // Apis here
    giphyMemes: 'http://api.giphy.com/v1/gifs/search?limit=10&api_key=3dEcVRH1SquXQ50csTRKQnxK8aTT0yxt&q=',
    chuckNorrisJokes: 'https://api.chucknorris.io/jokes/search?query=',
    generalJokes: 'https://sv443.net/jokeapi/category/Any',
    geekJokes: 'https://geek-jokes.sameerkumar.website/api',
    corporateBSJokes: 'https://corporatebs-generator.sameerkumar.website',
    ronSwansonJokes: 'https://ron-swanson-quotes.herokuapp.com/v2/quotes',
    yoMommaJokes: 'https://api.yomomma.info',
    dadJokes: 'https://icanhazdadjoke.com/search?limit=10&term='
}
const relatedWordsAPI = 'https://api.datamuse.com/words?ml=';
const proxyURL = 'https://cors-anywhere.herokuapp.com/';

// Dynamic
var selectedAPIs = APIs;
var searchTerm;



// FUNCTIONS
function getJokes() {
    $('.mainContent').empty();

    for (let api in selectedAPIs) {
        if (selectedAPIs[api]) {
            let apiURL = selectedAPIs[api];
            let searchHeaders = {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }

            if (api === 'chuckNorrisJokes' || api === 'dadJokes' || api === 'giphyMemes') { // Parameters here
                apiURL += searchTerm;
            }

            searchHeaders.url = proxyURL + apiURL;

            // console.log(selectedAPIs[api]);
            // console.log(searchHeaders);

            $.ajax(searchHeaders).then(response => {
                let currentJoke = formatJoke(response, api);

                console.log(response);

                let newJoke = $('<p>').addClass('col-6 singleJoke').html(currentJoke);
                $('.mainContent').append(newJoke);
            })
        }
    }

    getSuggestions();
}

function formatJoke(response, api) { // Get jokes from response here
    let currentJoke;

    if (api === 'chuckNorrisJokes') {
        currentJoke = response.result[getRandomPos(response.result.length)].value;
    }
    else if (api === 'generalJokes') {
        if (response.type === 'twopart') {
            currentJoke = response.setup + '<br>' + response.delivery; // Need two properties
        }
        else if (response.type === 'single') {
            currentJoke = response.joke;
        }
    }
    else if (api === 'geekJokes') {
        currentJoke = response; // Returns a string
    }
    else if (api === 'corporateBSJokes') {
        currentJoke = response.phrase;
    }
    else if (api === 'ronSwansonJokes') {
        currentJoke = response[0]; // Returns an array
    }
    else if (api === 'yoMommaJokes') {
        currentJoke = JSON.parse(response).joke; // Have to parse this response because it's stringified by default
    }
    else if (api === 'dadJokes') {
        currentJoke = response.results[getRandomPos(response.results.length)].joke;
    }
    else if (api === 'giphyMemes') {
        currentJoke = response.data[getRandomPos(response.data.length)].images.fixed_height.url;
        currentJoke = '<img src="' + currentJoke + '">';
    }

    return currentJoke;
}

function getRandomPos(length) {
    let position = Math.floor(Math.random() * length);

    return position;
}

function getSuggestions() {
    $('.suggestedTerms').empty();

    $.ajax({
        url: relatedWordsAPI + searchTerm,
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        let i = 0;

        console.log(response);

        while (i < 10 && response[i]) {
            let currentSuggestion = response[getRandomPos(response.length)].word;

            let newSuggestion = $('<p>').addClass('col-6 singleSuggestion').html(currentSuggestion);
            $('.suggestedTerms').append(newSuggestion);

            i++;
        }
    })
}



// FUNCTION CALLS
$(document).ready(function () {
    $(document).on('click', '.singleJoke', event => {
        let target = $(event.target);

        responsiveVoice.speak(target.text());
    })

    $('.searchButton').on('click', event => {
        searchTerm = $('.searchBar').val();

        getJokes();
    })

    $('.suggestButton').on('click', event => {
        searchTerm = randWords[getRandomPos(randWords.length)].word;
        $('.searchBar').val(searchTerm);

        getJokes();
    })

    $(document).on('click', '.selectAPI', event => {
        let target = $(event.target);

        // console.log(target[0].checked);

        for (let api in selectedAPIs) {
            // console.log(api);

            if (!target[0].checked) { // Becomes unchecked before running this script
                if (api === target.attr('apiID')) {
                    selectedAPIs[api] = false;
                    target[0].checked = false;
                    break;
                }
            }
            else if (target[0].checked) {
                if (api === target.attr('apiID')) {
                    selectedAPIs[api] = target.attr('apiURL');
                    target[0].checked = true;
                    break;
                }
            }
        }
    })
})