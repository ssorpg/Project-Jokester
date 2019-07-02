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
const relatedWordsAPI = 'https://api.datamuse.com/words?ml='; // URL to get our suggestedTerms
const proxyURL = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy

// Dynamic
var selectedUsername; // Username of current user



// FUNCTIONS
function getJokes(searchTerm) {
    $('.mainContent').empty(); // Clear content for next joke search
    registry.child(selectedUsername).update({
        searchTerm: $('.searchBar').val(),
        searchResults: ''
    })

    for (let api in APIs) { // For each api...
        if (APIs[api].selected) { // If the api has been allowed...
            let apiURL = APIs[api].url; // Get the URL

            let searchHeaders = { // Create our search object for ajax
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (APIs[api].searchable) {
                apiURL += searchTerm; // For searchable APIs, add our searchTerm
            }
            else if (api === 'xkcdComics') {
                let searchForm = $('<form>');
                searchForm = searchForm.html('<input name="search" type="text" value="' + searchTerm + '">');

                console.log(searchForm[0]);

                let searchData = new FormData(searchForm[0]); // Convert to regular JS element

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
                    $('.mainContent').append(newJoke); // Put it on the page

                    registry.child(selectedUsername).update({
                        searchResults: $('.mainContent').html()
                    })
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
    localStorage.setItem('jokesterName', selectedUsername);

    registry.child(selectedUsername).once('value', snapshot => {
        if (snapshot.exists()) {
            snapshot = snapshot.val(); // Turn into a JS object for ease of use

            APIs = snapshot.APIs;
            pageSetup(snapshot);
        }
        else {
            registry.child(selectedUsername).update({
                name: selectedUsername,
                APIs: APIs
            })
            
            createAPIList();
        }
    })
}

function pageSetup(snapshot) {
    $('.mainContent').html(snapshot.searchResults);
    $('.suggestedContent').html(snapshot.suggestions);
    $('.searchBar').val(snapshot.searchTerm);

    createAPIList();
}

function createAPIList() {
    for (let api in APIs) {
        let newLabel = $('<label>').addClass('selectAPI ' + api);
        newLabel.html('<input type="checkbox" apiID="' + api + '" checked>' + APIs[api].name);

        if (!APIs[api].selected) { // API not allowed
            newLabel.find('input').prop('checked', false);
        }

        $('.checkBoxes').append(newLabel);
    }

    $('.initial').css('display', 'none');
    $('.wrapper').css('display', 'block');
}



// FUNCTION CALLS
$(document).ready(function () { // Wait for page to load
    if (localStorage.getItem('jokesterName')) {
        selectedUsername = localStorage.getItem('jokesterName');

        $('.usernameInput').val(selectedUsername);
    }

    $('.hamburgerButton').on('click', event => {
        if ($('.checkBoxes').css('display') === 'none') {
            $('.checkBoxes').css('display', 'initial');
            $('.mainContent').css('display', 'none');
        }
        else {
            $('.checkBoxes').css('display', 'none');
            $('.mainContent').css('display', 'initial');
        }
    })

    $('.login').on('click', event => {
        selectedUsername = $('.usernameInput').val();

        getUser(selectedUsername);
    })

    $('.usernameInput').on('keypress', event => {
        if (event.keyCode === 13) { // 13 is the enter key
            event.preventDefault();

            selectedUsername = $('.usernameInput').val();

            getUser(selectedUsername);
        }
    });

    $(document).on('click', '.singleJoke', event => {
        let target = $(event.target);

        responsiveVoice.speak(target.text(), "UK English Male", {pitch: 2}); // Read out a clicked joke
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

        for (let api in APIs) {
            if (api === target.attr('apiID')) {
                if (target.prop('checked') === false) { // Checkbox unchecks BEFORE this script runs
                    APIs[api].selected = false; // Don't search this API
                    break; // We matched our API, so end
                }
                else if (target.prop('checked') === true) {
                    APIs[api].selected = true;
                    break;
                }
            }
        }

        registry.child(selectedUsername).update({
            APIs: APIs
        })

        console.log(APIs);
    });
});