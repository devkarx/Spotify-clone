



console.log("Lets write javascript")
let currentSong = new Audio();
let currFolder;
let songs;

function convTime(e) {
    const m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
        s = Math.floor(e % 60).toString().padStart(2, '0');

    return m + ':' + s;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let fileName = element.href.split(`/${folder}/`)[1];
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (let i = 0; i < songs.length; i++) {
        songUL.innerHTML += `<li>
            <div>
                <img class="invert" src="/images/music.svg">
            </div>
            <div class="songname">${songs[i].replaceAll("%20", " ")}</div>
            <div class="play2">
                <img class="playy2" src="/images/play2.svg">
            </div>
        </li>`;
    }

    let doc = document.querySelectorAll(".songname");
    doc.forEach(e => {
        e.addEventListener("click", element => {
            console.log("Playing " + e.innerText);
            playMusic(e.innerHTML);
        });
    });

    

    if (songs.length > 0) {
        playMusic(songs[0], true); 
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "/images/pause.svg";
    } else {
        play.src = "/images/play.svg";
    }
    
    document.querySelector(".trackinfo").innerHTML = decodeURI(track);
    
    currentSong.addEventListener("timeupdate", () => {
        let currTime = convTime(currentSong.currentTime);
        let totalTime = convTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = currTime + " / " + totalTime;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    });

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(track);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });
};

async function displayAlbums() {
    let firstAlbumFolder = null;
    
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let albumFolders = [];
    

    Array.from(anchors).forEach((e) => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            albumFolders.push(folder);
        }
    });

    if (albumFolders.length > 0) {
        firstAlbumFolder = albumFolders[0];
        console.log("Auto-loading first album:", firstAlbumFolder);
        await getSongs(`songs/${firstAlbumFolder}`);
    }

    for (let folder of albumFolders) {
        try {
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            let card = document.createElement("div");
            card.classList.add("cards");
            card.dataset.folder = folder;
            card.innerHTML = `
                <div class="play">
                    <img src="/images/transitionplay.svg">
                </div>
                <img height="210vh" src="/songs/${folder}/cover.jpg">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            `;
            cardContainer.appendChild(card);

            card.addEventListener("click", async () => {
                console.log("Clicked album:", folder);
                songs = await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
        } catch (error) {
            console.log(`Could not load info for album: ${folder}`);
        }
    }
    
    return firstAlbumFolder;
}

async function main() {
    await displayAlbums();

    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/images/play.svg"
        }
    })

    document.addEventListener("keydown", (e) => {
        if(e.code === "Space"){
           e.preventDefault();
           console.log(e);
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/images/play.svg"
        }
    }
    })

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left-anush").style.left="0"
    })
    
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left-anush").style.left="-200%"
        console.log("Hello")
    })

    document.getElementById("prev").addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }else{
            playMusic(songs[songs.length-1])
        }
    })

    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.code === "KeyN") {
            e.preventDefault();
            console.log("Shift + N pressed");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            playMusic((index + 1 < songs.length) ? songs[index + 1] : songs[0]);
        }

        if (e.shiftKey && e.code === "KeyP") {
            e.preventDefault();
            console.log("Shift + P pressed");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            playMusic((index - 1 >= 0) ? songs[index - 1] : songs[songs.length - 1]);
        }
    });

    document.getElementById("next").addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
        if((index+1)==songs.length){
            playMusic(songs[0])
        }
    })
    
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); 
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()