// GLOBALS
// Static

// Firebase
const firebaseConfig = { // Use this for registering users and saving lastSearch + selectedAPIs
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
const APIs = {
    giphyMemes: 'http://api.giphy.com/v1/gifs/search?limit=10&api_key=3dEcVRH1SquXQ50csTRKQnxK8aTT0yxt&q=',
    chuckNorrisJokes: 'https://api.chucknorris.io/jokes/search?query=',
    generalJokes: 'https://sv443.net/jokeapi/category/Any',
    geekJokes: 'https://geek-jokes.sameerkumar.website/api',
    corporateBS: 'https://corporatebs-generator.sameerkumar.website',
    ronSwansonQuotes: 'https://ron-swanson-quotes.herokuapp.com/v2/quotes',
    yoMommaJokes: 'https://api.yomomma.info',
    dadJokes: 'https://icanhazdadjoke.com/search?limit=10&term='
};
const relatedWordsAPI = 'https://api.datamuse.com/words?ml='; // URL to get our suggestedTerms
const proxyURL = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy

// Dynamic
var selectedAPIs = APIs; // The APIs our user allows



// FUNCTIONS
function getJokes(searchTerm) {
    $('.mainContent').empty(); // Clear content for next joke search

    for (let api in selectedAPIs) { // For each api...
        if (selectedAPIs[api]) { // If the api has been allowed...
            let apiURL = selectedAPIs[api]; // Get the URL

            let searchHeaders = { // Create our search object for ajax
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (api === 'chuckNorrisJokes' || api === 'dadJokes' || api === 'giphyMemes') {
                apiURL += searchTerm; // For searchable APIs, add our searchTerm
            }

            searchHeaders.url = proxyURL + apiURL; // Always use CORS proxy

            $.ajax(searchHeaders).then(response => {
                console.log(response);

                let currentJoke = formatJoke(response, api); // Get the actual joke from the response

                let newJoke = $('<p>').addClass('col-12 singleJoke').html('<button type="button" id="white" font-size:10px;">♪</button>' + `<span>${currentJoke}</span>`); // Create the joke
                $('.mainContent').append(newJoke); // Put it on the page
            });
        }
    }

    getSuggestions(searchTerm); // Get our suggestedTerms
}

function formatJoke(response, api) { // Get jokes from response here
    let currentJoke;

    try { // Catch arrays with no jokes in them (undefined)
        if (api === 'chuckNorrisJokes') {
            currentJoke = response.result[getRandomPos(response.result.length)].value; // Random joke
        }
        else if (api === 'generalJokes') {
            if (response.type === 'twopart') {
                currentJoke = response.setup + '<br>' + response.delivery; // Get two properties
            }
            else if (response.type === 'single') {
                currentJoke = response.joke; // String
            }
        }
        else if (api === 'geekJokes') {
            currentJoke = response; // String
        }
        else if (api === 'corporateBS') {
            currentJoke = response.phrase; // String
        }
        else if (api === 'ronSwansonQuotes') {
            currentJoke = response[0]; // Array
        }
        else if (api === 'yoMommaJokes') {
            currentJoke = JSON.parse(response).joke; // Have to parse this response because it's stringified by default
        }
        else if (api === 'dadJokes') {
            currentJoke = response.results[getRandomPos(response.results.length)].joke; // Random joke
        }
        else if (api === 'giphyMemes') {
            currentJoke = response.data[getRandomPos(response.data.length)].images.fixed_height.url; // Random image
            currentJoke = '<img src="' + currentJoke + '" style="max-width: 100%;">'; // Create image element
        }
    }
    catch (error) {
        console.log('ERR: No ' + api + ' found.');
    }

    return currentJoke;
}

function getRandomPos(length) {
    let position = Math.floor(Math.random() * length); // Random number 1 to array length

    return position;
}

function getSuggestions(searchTerm) {
    $('.suggestedContent').empty(); // Empty our suggestedTerms for new search

    $.ajax({
        url: relatedWordsAPI + searchTerm, // Only use one API for this so no need for a for loop
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        let i = 0;

        console.log(response);

        while (i < 10 && response[i]) { // Only get up to 10 results
            let currentSuggestion = response[getRandomPos(response.length)].word;

            let newSuggestion = $('<button>').addClass('col-6 singleSuggestion').html(currentSuggestion);
            $('.suggestedContent').append(newSuggestion);

            i++;
        }
    });
}



// FUNCTION CALLS
$(document).ready(function () { // Wait for page to load
    $(document).on('click', '.singleJoke', event => {
        let target = $(event.target);

        responsiveVoice.speak(target.text()); // Read out a clicked joke
    });

    $(document).on('click', '.singleSuggestion', event => {
        let target = $(event.target);

        let searchTerm = target.text(); // Get the suggested word text
        $('.searchBar').val(searchTerm); // Put the term in the search bar

        getJokes(searchTerm); // Get the jokes!
    });

    $('.searchButton').on('click', event => {
        let searchTerm = $('.searchBar').val(); // Get search term from search bar

        getJokes(searchTerm);
    });

    $('.suggestButton').on('click', event => {
        let searchTerm = randWords[getRandomPos(randWords.length)].word; // Get a random word from our dictionary
        $('.searchBar').val(searchTerm);

        getJokes(searchTerm);
    });

    $(document).on('click', '.selectAPI', event => { // When the user clicks a checkbox or it's label...
        event.preventDefault();

        let target = $(event.target.querySelector('input')); // Get the actual checkbox

        for (let api in selectedAPIs) {
            if (api === target.attr('apiID')) {
                if (target.prop('checked') === true) { // Is the checkbox checked or not
                    selectedAPIs[api] = false; // Don't search this API
                    target.prop('checked', false); // Uncheck this checkbox
                    break; // We matched our API, so end
                }
                else if (target.prop('checked') === false) {
                    selectedAPIs[api] = target.attr('apiURL');
                    target.prop('checked', true);
                    break;
                }
            }
        }

        console.log(selectedAPIs);
    });
});