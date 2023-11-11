const SETTINGS = {
    'delay_between_interactions': 2500
};


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var SOLVED = false;

async function waitForPage(page) {
    const p = document.getElementById(page);
    while(p.style.display != 'block') await delay(50);
}

async function skipMarketing(aaa) { // "Czy znasz slowko X? znam / nie znam -> pomin"
    const knowNewBtn = document.getElementById('dont_know_new');
    if(document.getElementById('learning_form').style.display == 'none') {
        knowNewBtn.click();
        const skipBtn = document.getElementById('skip');
        while(skipBtn.parentElement.style.display == 'none') {
            await delay(50);
        }
        skipBtn.click();

        console.log('[*] pominieto marketing', aaa);
        if(aaa == 0) await waitForPage('learning_page');
    }
}

async function checkIfDone() {
    if(document.getElementById('finish_page').style.display == 'block') {
        SOLVED = true;
        return true;
    }
}

var lastSaved = '-';

async function saveNewWord(word) {
    while(!document.getElementById('word').innerText || document.getElementById('word').innerText == lastSaved) {
        await delay(50);
    }

    await delay(1000); // wait for a whole second - just to be safe. it likes to save incorrect words - and then its kaput

    const correctWord = document.getElementById('word').innerText;
    lastSaved = correctWord;

    window.localStorage.setItem(word, correctWord);
    console.log('[*] zapisano nowe slowko:', word, ' = ', correctWord);
}

async function solveWord(word) {
    const checkBtn = document.getElementById('check');
    const answerInput = document.getElementById('answer');

    const answer = localStorage.getItem(word);
    if(answer) {
        answerInput.value = answer;
        
        checkBtn.click();

        // some words are broken (synonym "glitch"), replace them temporarily
        await waitForPage('answer_result_fieldset');
        if(document.getElementById('answer_result').querySelector('.blue')) {
            saveNewWord(word);
        }

        console.log('[+] rozwiazano slowko', word, ' = ', answer);
        return true;
    }
    // new word
    checkBtn.click();

    await saveNewWord(word);

    return false;
}

var start = 0;

async function solve() {
    const d = SETTINGS.delay_between_interactions;

    await delay(d);

    await waitForPage('learning_page');

    await skipMarketing(0);

    const current = document.querySelector('.translations').innerText; // not needed, but useful if you edit the localStorage directly
    const usage = document.querySelector('.usage_example').innerText; // usage is saved to counter the synonym error
    await solveWord(current+'-=-'+usage);

    await delay(d);

    await skipMarketing(1);

    await waitForPage('answer_page');
    document.getElementById('next_word').click();

    await delay(d);

    await skipMarketing(2);


    const finishPage = document.getElementById('finish_page');
    const learningPage = document.getElementById('learning_page');
    while(finishPage.style.display != 'block' && learningPage.style.display != 'block') await delay(50);

    if(finishPage.style.display == 'block') {
        SOLVED = true;
        console.log('[+] zakonczono sesje instaling w', (new Date().getTime() - start) / 1000, 'sekund');
        return;
    }

    await waitForPage('learning_page');

    await skipMarketing(3);


    !SOLVED && solve();
}

async function initSession() {
    if(document.getElementById('start_session_button').parentElement.style.display != 'none') {
        document.getElementById('start_session_button').click();
        console.log('[+] rozpoczynanie sesji...');
    }
    if(document.getElementById('continue_session_button').parentElement.style.display != 'none') {
        document.getElementById('continue_session_button').click();
        console.log('[+] kontynuowanie sesji...');
    }
}

initSession();
solve();
start = new Date().getTime();