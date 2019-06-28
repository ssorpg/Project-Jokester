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
const apis = { // Apis here
    chuckNorrisJokes: 'https://api.chucknorris.io/jokes/search?query=',
    generalJokes: 'https://sv443.net/jokeapi/category/Any',
    geekJokes: 'https://geek-jokes.sameerkumar.website/api',
    corporateBSJokes: 'https://corporatebs-generator.sameerkumar.website',
    ronSwansonJokes: 'https://ron-swanson-quotes.herokuapp.com/v2/quotes',
    yoMommaJokes: 'https://api.yomomma.info',
    dadJokes: 'https://icanhazdadjoke.com/search?limit=10&term='
}
const proxyurl = "https://cors-anywhere.herokuapp.com/";

// Dynamic
var selectedAPIs = apis;
var searchTerm = 'Cat';



// FUNCTIONS
function getJokes() {
    for (let api in selectedAPIs) {
        if (selectedAPIs[api]) {
            let apiURL = selectedAPIs[api];

            if (api === 'chuckNorrisJokes' || api === 'dadJokes') { // Parameters here
                apiURL += searchTerm;
            }


            // console.log(selectedAPIs[api]);
            $.ajax({
                url: proxyurl + apiURL,
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }

            }).then(response => {
                let currentJoke = formatJoke(response, api);

                console.log(response);

                let newJokeLine = $('<p>').text(api + ': ' + currentJoke);
                $('#wrapper').append(newJokeLine);
            })
        }
    }
}

function formatJoke(response, api) { // Get jokes from response here
    let currentJoke;

    if (api === 'chuckNorrisJokes') {
        currentJoke = response.result[Math.floor(Math.random() * response.result.length)].value;
    }
    else if (api === 'generalJokes') {
        if (response.type === 'twopart') {
            currentJoke = response.setup + ' ' + response.delivery; // Need two properties
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
        currentJoke = response.results[Math.floor(Math.random() * response.results.length)].joke;
    }

    return currentJoke;
}



// FUNCTION CALLS
$(document).ready(function () {
    $(document).on('click', 'p', event => {
        let target = $(event.target);

        responsiveVoice.speak(target.text());
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

    getJokes();
})