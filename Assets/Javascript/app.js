// GLOBALS
// Static

// Firebase
const firebaseConfig = { // Use this for registering users and saving their search info
    apiKey: "AIzaSyCte7lhLlrSr3m3turhqLQQy3_3YSBymWE",
    authDomain: "trilogy-r-p-s.firebaseapp.com",
    databaseURL: "https://trilogy-r-p-s.firebaseio.com",
    projectId: "trilogy-r-p-s",
    storageBucket: "trilogy-r-p-s.appspot.com",
    messagingSenderId: "545722149214",
    appId: "1:545722149214:web:633cee7329b7a2af"
};

firebase.initializeApp(firebaseConfig); // Initiate Firebase
const database = firebase.database();
const registry = database.ref('projectJokester/registry'); // Only need to use the registry currently

// APIs
const relatedWordsAPI = 'https://api.datamuse.com/words?ml='; // URL to get our suggestedTerms
const proxyURL = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy

// Dynamic
var selectedUsername; // Username of current user
var images = ['url("Assets/Images/ron-swanson-wallpaper-hd-1080p-351252.jpg")', 'url("Assets/Images/geek.png")', 'url("Assets/Images/164149768-chuck-norris-wallpapers.jpg")'];



// FUNCTIONS
function getJokes(searchTerm) {
    $('.mainContent').empty(); // Clear content for next joke search
    changeBackground(); // New background

    registry.child(selectedUsername).update({ // Update the user's last search on Firebase
        searchTerm: $('.searchBar').val(),
        searchResults: ''
    })

    for (let api in APIs) { // For each api...
        if (APIs[api].selected) { // If the api has been allowed...
            let apiURL = APIs[api].url; // Get the URL

            let searchHeaders = { // Create our search object for ajax
                method: "GET",
                headers: {
                    'Accept': 'application/json' // We only want JSON objects
                }
            };

            if (APIs[api].searchable) {
                apiURL += searchTerm; // For searchable APIs, add our searchTerm
            }
            else if (api === 'xkcdComics') { // xkcdComics requires POST and uses PHP to search the JSON objects they store
                let searchForm = $('<form>');
                searchForm = searchForm.html('<input name="search" type="text" value="' + searchTerm + '">');

                let searchData = new FormData(searchForm[0]); // Convert to regular JS element and store in FormData

                searchHeaders = { // Sending off our FormData with our search query
                    method: "POST",
                    data: searchData,
                    contentType: false,
                    processData: false
                }
            }

            searchHeaders.url = proxyURL + apiURL; // Always use CORS proxy

            $.ajax(searchHeaders).then(response => {
                let currentJoke = formatJoke(response, api); // Get the actual joke from the response

                if (currentJoke) {
                    let newJoke; // Our joke element

                    if (currentJoke.type === 'string') { // Strings can be read out loud and so have a 'Speak Joke' button added
                        newJoke = $('<p>').addClass('col-12 singleJoke ' + api).html('<button class="button"><span>🗣</span></button><span class="jokeText">' + currentJoke.joke + '</span>'); // Create the joke
                    }
                    else if (currentJoke.type === 'image') {
                        newJoke = $('<p>').addClass('col-12 singleJoke ' + api).html(currentJoke.joke);
                    }
                    $('.mainContent').append(newJoke); // Put it on the page

                    registry.child(selectedUsername).update({ // Update Firebase with the jokes we got
                        searchResults: $('.mainContent').html()
                    })
                }
            });
        }
    }

    getSuggestions(searchTerm); // Get our suggestedTerms
}

function formatJoke(response, api) { // Parse joke response here
    let currentJoke = {};

    try { // Catch no joke returned
        switch (api) {
            case 'chuckNorrisJokes':
                currentJoke.joke = response.result[getRandomPos(response.result.length)].value;
                currentJoke.type = 'string';
                break;
            case 'generalJokes':
                if (response.type === 'twopart') {
                    currentJoke.joke = response.setup + '<br><br>' + response.delivery; // Has two parts of the joke
                    currentJoke.type = 'string';
                }
                else if (response.type === 'single') {
                    currentJoke.joke = response.joke;
                    currentJoke.type = 'string';
                }
                break;
            // case 'geekJokes':
            //     currentJoke = response;
            //     currentJoke.type = 'string';
            //     break;
            // case 'corporateBS':
            //     currentJoke = response.phrase;
            //     currentJoke.type = 'string';
            //     break;
            case 'ronSwansonQuotes':
                currentJoke.joke = response[0];
                currentJoke.type = 'string';
                break;
            case 'yoMommaJokes':
                currentJoke.joke = JSON.parse(response).joke; // Stringified by default
                currentJoke.type = 'string';
                break;
            case 'dadJokes':
                currentJoke.joke = response.results[getRandomPos(response.results.length)].joke;
                currentJoke.type = 'string';
                break;
            case 'giphyMemes':
                currentJoke.joke = response.data[getRandomPos(response.data.length)].images.fixed_height.url;
                currentJoke.joke = '<img src="' + currentJoke.joke + '">'; // Create image html
                currentJoke.type = 'image';
                break;
            // case 'tronaldDumpQuotes':
            //     currentJoke = 'Trump:<br>' + response._embedded.quotes[getRandomPos(response._embedded.quotes.length)].value;
            //     currentJoke.type = 'string';
            //     break;
            case 'xkcdComics':
                currentJoke.joke = JSON.parse(response).results[0].image;
                currentJoke.joke = '<a href="' + currentJoke.joke + '" target="_blank"><img src="' + currentJoke.joke + '"></a>';
                currentJoke.type = 'image';
        }
    }
    catch (error) {
        console.log('ERR: No ' + api + ' found.'); // Sometimes we don't find any jokes in the search
    }

    return currentJoke;
}

function getRandomPos(length) {
    let position = Math.floor(Math.random() * length); // Random number from 1 to array length

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

        while (numSuggestions < 10 && response[numSuggestions]) { // Only get up to 10 results
            let currentSuggestion = response[getRandomPos(response.length)].word;

            let newSuggestion = $('<button>').addClass('col-6 singleSuggestion').html(currentSuggestion); // New button element
            $('.suggestedContent').append(newSuggestion);

            numSuggestions++;
        }

        registry.child(selectedUsername).update({ // Update Firebase with our latest suggestedTerms
            suggestions: $('.suggestedContent').html()
        });
    });
}

function getUser() {
    localStorage.setItem('jokesterName', selectedUsername); // So user doesn't have to type in their name every time they visit (more advanced would be cookies)

    registry.child(selectedUsername).once('value', snapshot => { // Let's see if the user's in the registry
        if (snapshot.exists()) { // Found them
            snapshot = snapshot.val(); // Turn into a JS object for ease of use

            APIs = snapshot.APIs;
            pageSetup(snapshot); // Put their info on the page
        }
        else { // New user
            registry.child(selectedUsername).update({ // Create them
                name: selectedUsername,
                APIs: APIs
            })
            
            createAPIList(); // Set their selected APIs
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
        let newLabel = $('<label>').addClass('selectAPI ' + api); // Recreate the checkboxes and labels every time we load page
        newLabel.html('<input type="checkbox" apiID="' + api + '" checked>' + APIs[api].name);

        if (!APIs[api].selected) { // API not allowed
            newLabel.find('input').prop('checked', false);
        }

        $('.checkBoxes').append(newLabel);
    }

    $('.initial').css('display', 'none'); // Get rid of login page
    $('.wrapper').css('display', 'block'); // Put up the search page!
}

function randomBackground() {
    let i = Math.floor(Math.random() * images.length);
    return images[i];
}

function changeBackground() {
    document.body.style.backgroundImage = randomBackground();
}



// FUNCTION CALLS
$(document).ready(function () { // Wait for page to load
    if (localStorage.getItem('jokesterName')) { // If they logged in before...
        selectedUsername = localStorage.getItem('jokesterName'); // Get their login name

        $('.usernameInput').val(selectedUsername); // Put their name in the login field but don't log in (maybe they want to log in as someone else)
    }

    $(window).on('resize', function () {
        if ($('body').width() > 999) {
            $('.mainContent').removeAttr('style');
            $('.checkBoxes').removeAttr('style');
        }
    });

    $('.hamburgerButton').on('click', function () { // Toggle for hamburger menu
        if ($('.checkBoxes').css('display') === 'none') {
            $('.checkBoxes').css('display', 'initial');
            $('.mainContent').css('display', 'none');
        }
        else {
            $('.checkBoxes').removeAttr('style');
            $('.mainContent').removeAttr('style');
        }
    })

    $('.login').on('click', function () { // When clicking login...
        if ($('.usernameInput').val()) {
            selectedUsername = $('.usernameInput').val(); // Get their entered username

            getUser(selectedUsername); // Log them in
        }
        else {
            $('#noUsername').addClass('show');
        }
    })

    $('.usernameInput').on('keypress', event => { // When pressing a key...
        if (event.keyCode === 13) { // If it's the enter key...
            event.preventDefault();

            if ($('.usernameInput').val()) {
                selectedUsername = $('.usernameInput').val(); // Get their entered username

                getUser(selectedUsername); // Log them in
            }
            else {
                $('#noUsername').addClass('show');
            }
        }
    });

    $(document).on('click', '.button', event => { // 'Speak Joke' button
        if(responsiveVoice.isPlaying()) { // Button can be used as a toggle
            responsiveVoice.cancel();
            return;
        }
        
        let target = $(event.target).closest('.singleJoke').find('.jokeText'); // Gets the joke text for this button

        responsiveVoice.speak(target.text(), "UK English Male", {pitch: 2}); // Read out a clicked joke (in a funny voice)
    });

    $(document).on('click', '.singleSuggestion', event => {
        let target = $(event.target);

        let searchTerm = target.text(); // Get the suggested word text
        $('.searchBar').val(searchTerm); // Put the term in the search bar

        getJokes(searchTerm); // Get the jokes!
    });

    $('.searchButton').on('click', function () {
        let searchTerm = $('.searchBar').val(); // Get search term from search bar

        getJokes(searchTerm);
    });

    $('.searchBar').on('keypress', event => {
        if (event.keyCode === 13) { // 13 is the enter key
            event.preventDefault();

            let searchTerm = $('.searchBar').val();

            getJokes(searchTerm);
        }
    });

    $('.suggestButton').on('click', function () {
        let searchTerm = randWords[getRandomPos(randWords.length)].word; // Get a random word from our dictionary
        $('.searchBar').val(searchTerm); // Put the word in the search bar as if it had been typed

        getJokes(searchTerm);
    });

    $(document).on('click', '.selectAPI', event => { // When the user clicks a checkbox or it's label...
        let target = $(event.target);

        if (target.is('label')) {
            target = $(event.target.querySelector('input')); // Get the checkbox child
        }

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

        registry.child(selectedUsername).update({ // Update Firebase with the selected APIs
            APIs: APIs
        })
    });
});