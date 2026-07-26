import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

    getDatabase,
    ref,
    push,
    onChildAdded,
    onValue,
    set,
    onDisconnect

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


console.log("🌸 Torn Souls Started");


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCwCdHJyakIOFDMdZftgvf9IIctZAyAFG0",

    authDomain:
        "torn-souls-gc.firebaseapp.com",

    databaseURL:
        "https://torn-souls-gc-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "torn-souls-gc",

    storageBucket:
        "torn-souls-gc.firebasestorage.app",

    messagingSenderId:
        "483834372453",

    appId:
        "1:483834372453:web:cff6555ffe4521d8ab418c"

};


const app =
    initializeApp(firebaseConfig);


const db =
    getDatabase(app);


/* =========================
   DATABASE REFERENCES
========================= */

const chatRef =
    ref(db, "messages");


const onlineRef =
    ref(db, "online");


const bottleRef =
    ref(db, "bottles");


const profilesRef =
    ref(db, "profiles");


/* =========================
   ELEMENTS
========================= */

const messages =
    document.getElementById("messages");


const input =
    document.getElementById("messageInput");


const sendBtn =
    document.getElementById("sendBtn");


const emojiBtn =
    document.getElementById("emojiBtn");


const bottleBtn =
    document.getElementById("bottleBtn");


const nameBox =
    document.getElementById("nameBox");


const nameInput =
    document.getElementById("nameInput");


const saveName =
    document.getElementById("saveName");


const onlineCount =
    document.getElementById("onlineCount");


const typing =
    document.getElementById("typing");


/* PROFILE */

const profileBtn =
    document.getElementById("profileBtn");


const profilePanel =
    document.getElementById("profilePanel");


const closeProfile =
    document.getElementById("closeProfile");


const memberList =
    document.getElementById("memberList");


const changeNameInput =
    document.getElementById("changeNameInput");


const changeNameBtn =
    document.getElementById("changeNameBtn");


/* REPLY */

const replyPreview =
    document.getElementById("replyPreview");


const replyPreviewName =
    document.getElementById("replyPreviewName");


const replyPreviewText =
    document.getElementById("replyPreviewText");


const cancelReply =
    document.getElementById("cancelReply");


/* =========================
   USER DATA
========================= */

let nickname =
    localStorage.getItem("nickname");


let userId =
    localStorage.getItem("userId");


if (!userId) {

    userId =
        crypto.randomUUID();


    localStorage.setItem(
        "userId",
        userId
    );

}


/* =========================
   FLOWER PROFILE
========================= */

let flower =
    localStorage.getItem("flower")
    || "🌸";


let bio =
    localStorage.getItem("bio")
    || "";


let mood =
    localStorage.getItem("mood")
    || "🌙";


function getMyProfile() {

    return {

        name:
            nickname,

        flower:
            flower,

        bio:
            bio,

        mood:
            mood,

        userId:
            userId

    };

}


function saveProfile() {

    if (!nickname)
        return;


    set(

        ref(
            db,
            "profiles/" + userId
        ),

        getMyProfile()

    );

}


/* =========================
   REPLY STATE
========================= */

let replyingTo =
    null;


/* =========================
   NAME SCREEN
========================= */

if (nickname) {

    nameBox.style.display =
        "none";


    startOnline();


    saveProfile();

}


saveName.onclick =
    () => {

        const name =
            nameInput.value.trim();


        if (
            name.length < 2
        ) {

            alert(
                "Enter a valid name"
            );


            return;

        }


        nickname =
            name;


        localStorage.setItem(
            "nickname",
            nickname
        );


        nameBox.style.display =
            "none";


        startOnline();


        saveProfile();


        input.focus();

    };


/* =========================
   ONLINE USERS
========================= */

function startOnline() {

    const userRef =
        ref(
            db,
            "online/" + userId
        );


    set(

        userRef,

        {

            name:
                nickname,

            active:
                true

        }

    );


    onDisconnect(
        userRef
    ).remove();


    onValue(

        onlineRef,

        (snapshot) => {

            const users =
                snapshot.size;


            onlineCount.innerText =
                users +
                " Online members";

        }

    );

}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const text =
        input.value.trim();


    if (
        !text ||
        !nickname
    )
        return;


    if (
        text.length > 500
    ) {

        alert(
            "Message too long"
        );


        return;

    }


    const now =
        new Date();


    const messageData = {

        name:
            nickname,

        text:
            text,

        time:

            now.toLocaleTimeString(

                [],

                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }

            ),

        userId:
            userId

    };


    if (
        replyingTo
    ) {

        messageData.replyTo = {

            name:
                replyingTo.name,

            text:
                replyingTo.text,

            messageId:
                replyingTo.messageId

        };

    }


    await push(

        chatRef,

        messageData

    );


    input.value =
        "";


    typing.innerText =
        "";


    cancelReplyMessage();

}


sendBtn.onclick =
    sendMessage;


/* ENTER TO SEND */

input.addEventListener(

    "keydown",

    (event) => {

        if (

            event.key === "Enter" &&
            !event.shiftKey

        ) {

            event.preventDefault();


            sendMessage();

        }

    }

);


/* =========================
   TYPING
========================= */

let typingTimer;


input.addEventListener(

    "input",

    () => {

        if (
            !nickname
        )
            return;


        typing.innerText =
            "Typing...";


        clearTimeout(
            typingTimer
        );


        typingTimer =
            setTimeout(

                () => {

                    typing.innerText =
                        "";

                },

                1000

            );

    }

);


/* =========================
   RECEIVE MESSAGES
========================= */

onChildAdded(

    chatRef,

    (snapshot) => {

        const data =
            snapshot.val();


        const messageId =
            snapshot.key;


        const box =
            document.createElement(
                "div"
            );


        box.className =

            data.userId === userId

                ? "message mine"

                : "message";


        box.dataset.messageId =
            messageId;


        let replyHTML =
            "";


        if (
            data.replyTo
        ) {

            replyHTML = `

                <div class="replied-message">

                    <strong>
                        ↩
                        ${escapeHtml(
                            data.replyTo.name
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            data.replyTo.text
                        )}
                    </span>

                </div>

            `;

        }


        box.innerHTML = `

            ${replyHTML}


            <div class="sender">

                ${escapeHtml(
                    data.name ||
                    "Unknown"
                )}

            </div>


            <div class="text">

                ${escapeHtml(
                    data.text ||
                    ""
                )}

            </div>


            <div class="time">

                ${escapeHtml(
                    data.time ||
                    ""
                )}

            </div>


            <button
                class="reply-btn"
                type="button"
            >
                ↩ Reply
            </button>


            <div class="reaction-bar">

                <button
                    data-reaction="🌸"
                >
                    🌸
                </button>

                <button
                    data-reaction="🫶"
                >
                    🫶
                </button>

                <button
                    data-reaction="🥀"
                >
                    🥀
                </button>

                <button
                    data-reaction="😂"
                >
                    😂
                </button>

                <button
                    data-reaction="✨"
                >
                    ✨
                </button>

            </div>


            <div
                class="reaction-counts"
                id="reactions-${messageId}"
            >

            </div>

        `;


        messages.appendChild(
            box
        );


        /* REPLY BUTTON */

        const replyButton =
            box.querySelector(
                ".reply-btn"
            );


        replyButton.onclick =
            () => {

                startReply({

                    name:
                        data.name,

                    text:
                        data.text,

                    messageId:
                        messageId

                });

            };


        /* SELECTED TEXT REPLY */

        const textElement =
            box.querySelector(
                ".text"
            );


        textElement.addEventListener(

            "mouseup",

            () => {

                const selection =
                    window.getSelection();


                const selectedText =
                    selection
                        .toString()
                        .trim();


                if (
                    selectedText.length > 0
                ) {

                    startReply({

                        name:
                            data.name,

                        text:
                            selectedText,

                        messageId:
                            messageId

                    });

                }

            }

        );


        /* REACTIONS */

        const reactionButtons =
            box.querySelectorAll(
                "[data-reaction]"
            );


        reactionButtons.forEach(

            button => {

                button.onclick =
                    () => {

                        reactToMessage(

                            messageId,

                            button.dataset
                                .reaction

                        );

                    };

            }

        );


        loadReactions(
            messageId
        );


        messages.scrollTop =
            messages.scrollHeight;

    }

);


/* =========================
   REPLY SYSTEM
========================= */

function startReply(
    message
) {

    replyingTo =
        message;


    replyPreviewName.innerText =
        "Replying to " +
        message.name;


    replyPreviewText.innerText =
        message.text;


    replyPreview.style.display =
        "flex";


    input.focus();

}


function cancelReplyMessage() {

    replyingTo =
        null;


    replyPreview.style.display =
        "none";


    replyPreviewName.innerText =
        "";


    replyPreviewText.innerText =
        "";

}


cancelReply.onclick =
    cancelReplyMessage;


/* =========================
   EMOJI
========================= */

emojiBtn.onclick =
    () => {

        input.value +=
            "😊";


        input.focus();

    };


/* =========================
   MEMBERS PANEL
========================= */

profileBtn.onclick =
    () => {

        profilePanel.style.display =
            "flex";


        loadMembers();

    };


closeProfile.onclick =
    () => {

        profilePanel.style.display =
            "none";

    };


function loadMembers() {

    onValue(

        onlineRef,

        (snapshot) => {

            memberList.innerHTML =
                "";


            snapshot.forEach(

                (user) => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "member";


                    div.innerText =
                        "🌸 " +
                        user.val()
                            .name;


                    memberList.appendChild(
                        div
                    );

                }

            );

        }

    );

}


/* =========================
   CHANGE NAME
========================= */

changeNameBtn.onclick =
    () => {

        const newName =
            changeNameInput
                .value
                .trim();


        if (
            newName.length < 2
        ) {

            alert(
                "Name too short"
            );


            return;

        }


        nickname =
            newName;


        localStorage.setItem(
            "nickname",
            nickname
        );


        set(

            ref(

                db,

                "online/" +
                userId

            ),

            {

                name:
                    nickname,

                active:
                    true

            }

        );


        saveProfile();


        changeNameInput.value =
            "";


        alert(
            "Nickname changed 🌸"
        );

    };


/* =========================
   MESSAGE REACTIONS
========================= */

function reactToMessage(
    messageId,
    emoji
) {

    set(

        ref(

            db,

            "reactions/" +
            messageId +
            "/" +
            userId

        ),

        {

            emoji:
                emoji,

            name:
                nickname

        }

    );

}


function loadReactions(
    messageId
) {

    const reactionsRef =
        ref(

            db,

            "reactions/" +
            messageId

        );


    onValue(

        reactionsRef,

        (snapshot) => {

            const reactionBox =
                document.getElementById(
                    "reactions-" +
                    messageId
                );


            if (
                !reactionBox
            )
                return;


            reactionBox.innerHTML =
                "";


            const counts = {};


            snapshot.forEach(

                child => {

                    const reaction =
                        child.val()
                            .emoji;


                    counts[reaction] =
                        (

                            counts[reaction]
                            || 0

                        ) + 1;

                }

            );


            Object.keys(
                counts
            ).forEach(

                emoji => {

                    const span =
                        document.createElement(
                            "span"
                        );


                    span.className =
                        "reaction-count";


                    span.innerText =

                        emoji +
                        " " +
                        counts[emoji];


                    reactionBox.appendChild(
                        span
                    );

                }

            );

        }

    );

}


/* =========================
   MESSAGE IN A BOTTLE
========================= */

bottleBtn.onclick =
    async () => {

        const text =
            input.value.trim();


        if (
            !text
        ) {

            alert(
                "Write something to put in the bottle 🫧"
            );


            return;

        }


        await push(

            bottleRef,

            {

                text:
                    text,

                createdAt:
                    Date.now(),

                opened:
                    false

            }

        );


        input.value =
            "";


        alert(
            "Your message was released into the universe 🫧"
        );

    };





/* =========================
   SECURITY
========================= */

function escapeHtml(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   LOAD
========================= */

window.onload =
    () => {

        if (
            nickname
        ) {

            input.focus();

        }

    };