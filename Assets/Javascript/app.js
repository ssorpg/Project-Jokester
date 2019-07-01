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
const registry = database.ref('projectJokester/registry');

// APIs
const APIs = {
    giphyMemes: 'http://api.giphy.com/v1/gifs/search?limit=10&api_key=3dEcVRH1SquXQ50csTRKQnxK8aTT0yxt&q=',
    chuckNorrisJokes: 'https://api.chucknorris.io/jokes/search?query=',
    generalJokes: 'https://sv443.net/jokeapi/category/Any',
    geekJokes: 'https://geek-jokes.sameerkumar.website/api',
    corporateBS: 'https://corporatebs-generator.sameerkumar.website',
    ronSwansonQuotes: 'https://ron-swanson-quotes.herokuapp.com/v2/quotes',
    yoMommaJokes: 'https://api.yomomma.info',
    dadJokes: 'https://icanhazdadjoke.com/search?limit=10&term=',
    tronaldDumpQuotes: 'https://api.tronalddump.io/search/quote?query=',
    xkcdComics: 'https://relevant-xkcd-backend.herokuapp.com/search'
};
const searchableAPIs = {
    giphyMemes: true,
    chuckNorrisJokes: true,
    dadJokes: true,
    tronaldDumpQuotes: true
};
const relatedWordsAPI = 'https://api.datamuse.com/words?ml='; // URL to get our suggestedTerms
const proxyURL = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy

// Dynamic
var selectedAPIs = APIs; // The APIs our user allows
var selectedUsername; // Username of current user



// FUNCTIONS
function getJokes(searchTerm) {
    $('.mainContent').empty(); // Clear content for next joke search
    registry.child(selectedUsername).update({
        searchTerm: $('.searchBar').val(),
        searchResults: ''
    })

    for (let api in selectedAPIs) { // For each api...
        if (selectedAPIs[api]) { // If the api has been allowed...
            let apiURL = selectedAPIs[api]; // Get the URL

            let searchHeaders = { // Create our search object for ajax
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (searchableAPIs[api]) {
                apiURL += searchTerm; // For searchable APIs, add our searchTerm
            }
            else if (api === 'xkcdComics') {
                let searchForm = $('<form>');
                searchForm = searchForm.html('<input name="search" type="text" value="' + searchTerm + '">');

                console.log(searchForm[0]);

                let searchData = new FormData(searchForm[0]); // COnvert to regular JS element

                searchHeaders = {
                    method: "POST",
                    data: searchData,
                    contentType: false,
                    processData: false
                }
            }

            searchHeaders.url = proxyURL + apiURL; // Always use CORS proxy

            $.ajax(searchHeaders).then(response => {
                console.log(api + ' response: ');
                console.log(response);

                let currentJoke = formatJoke(response, api); // Get the actual joke from the response

                if (currentJoke) {
                    let newJoke = $('<p>').addClass('col-12 singleJoke ' + api).html(currentJoke); // Create the joke
                    registry.child(selectedUsername).update({
                        searchResults: $('.mainContent').html()
                    })
                    $('.mainContent').append(newJoke); // Put it on the page
                }
            });
        }
    }

    getSuggestions(searchTerm); // Get our suggestedTerms
}

function formatJoke(response, api) { // Get jokes from response here
    let currentJoke;

    try { // Catch arrays with no jokes in them (undefined)
        switch (api) {
            case 'chuckNorrisJokes':
                currentJoke = response.result[getRandomPos(response.result.length)].value; // Random joke
                break;
            case 'generalJokes':
                if (response.type === 'twopart') {
                    currentJoke = response.setup + '<br>' + response.delivery; // Get two properties
                }
                else if (response.type === 'single') {
                    currentJoke = response.joke; // String
                }
                break;
            case 'geekJokes':
                currentJoke = response; // String
                break;
            case 'corporateBS':
                currentJoke = response.phrase; // String
                break;
            case 'ronSwansonQuotes':
                currentJoke = response[0]; // Array
                break;
            case 'yoMommaJokes':
                currentJoke = JSON.parse(response).joke; // Stringified by default
                break;
            case 'dadJokes':
                currentJoke = response.results[getRandomPos(response.results.length)].joke; // Random joke
                break;
            case 'giphyMemes':
                currentJoke = response.data[getRandomPos(response.data.length)].images.fixed_height.url; // Random image
                currentJoke = '<img src="' + currentJoke + '">'; // Create image element
                break;
            case 'tronaldDumpQuotes':
                currentJoke = 'Trump:<br>' + response._embedded.quotes[getRandomPos(response._embedded.quotes.length)].value;
                break;
            case 'xkcdComics':
                currentJoke = JSON.parse(response).results[0].image; // First image
                currentJoke = '<a href="' + currentJoke + '" target="_blank"><img src="' + currentJoke + '"></a>'; // Create image element
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
        url: relatedWordsAPI + searchTerm, // Only use one API for this so no need for a loop
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        let numSuggestions = 0;

        console.log(response);

        while (numSuggestions < 10 && response[numSuggestions]) { // Only get up to 10 results
            let currentSuggestion = response[getRandomPos(response.length)].word;

            let newSuggestion = $('<button>').addClass('col-6 singleSuggestion').html(currentSuggestion);
            $('.suggestedContent').append(newSuggestion);

            numSuggestions++;
        }

        registry.child(selectedUsername).update({
            suggestions: $('.suggestedContent').html()
        });
    });
}

function getUser() {
    registry.child(selectedUsername).once('value', snapshot => {
        if (snapshot.exists()) {
            pageSetup(snapshot.val()); // Turn into a JS object for ease of use
        }
        else {
            registry.child(selectedUsername).update({
                name: selectedUsername,
                selectedAPIs: selectedAPIs
            })
        }
    })

    $('.initial').css('display', 'none');
    $('.wrapper').css('display', 'block');
}

function pageSetup(snapshot) {
    $('.mainContent').html(snapshot.searchResults);
    $('.suggestedContent').html(snapshot.suggestions);
    $('.searchBar').val(snapshot.searchTerm);
    selectedAPIs = snapshot.selectedAPIs;

    for (let api in selectedAPIs) {
        let newLabel = $('<label>').addClass('selectAPI ' + api);
        newLabel.html('<input type="checkbox" apiID="' + api + '" apiURL="' + selectedAPIs[api] + '" checked>');

        if (!selectedAPIs[api]) { // API not allowed
            newLabel.find('input').prop('checked', false);
        }

        $('.checkBoxes').append(newLabel);
    }
}



// FUNCTION CALLS
$(document).ready(function () { // Wait for page to load
    $('.usernameInput').on('keypress', event => {
        if (event.keyCode === 13) { // 13 is the enter key
            event.preventDefault();

            selectedUsername = $('.usernameInput').val();

            getUser(selectedUsername);
        }
    });

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

    $('.searchBar').on('keypress', event => {
        if (event.keyCode === 13) { // 13 is the enter key
            event.preventDefault();

            let searchTerm = $('.searchBar').val(); // Get search term from search bar

            getJokes(searchTerm);
        }
    });

    $('.suggestButton').on('click', event => {
        let searchTerm = randWords[getRandomPos(randWords.length)].word; // Get a random word from our dictionary
        $('.searchBar').val(searchTerm);

        getJokes(searchTerm);
    });

    $(document).on('click', '.selectAPI', event => { // When the user clicks a checkbox or it's label...
        let target = $(event.target);

        if (target.is('label')) {
            target = $(event.target.querySelector('input')); // Get the checkbox child
        }

        console.log(target.attr('checked'));

        for (let api in selectedAPIs) {
            if (api === target.attr('apiID')) {
                if (target.prop('checked') === false) { // Checkbox unchecks BEFORE this script runs
                    selectedAPIs[api] = false; // Don't search this API
                    break; // We matched our API, so end
                }
                else if (target.prop('checked') === true) {
                    selectedAPIs[api] = target.attr('apiURL');
                    break;
                }
            }
        }

        registry.child(selectedUsername).update({
            selectedAPIs: selectedAPIs
        })

        console.log(selectedAPIs);
    });
});