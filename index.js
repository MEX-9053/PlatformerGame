let nameInput = document.querySelector(".name-input")
window.onload = function reset() {
    sessionStorage.setItem("character", "")
    nameInput.value = ""
    sessionStorage.setItem("score", "0")
    sessionStorage.setItem("time", "0")
    sessionStorage.setItem("levelCount", "1")
}
let prev = document.querySelector(".prev")
let next = document.querySelector(".next")
let slides = document.querySelectorAll(".character-item")
let shiftIndex = slides[0].offsetWidth + 2 * Number(window.getComputedStyle(slides[0], null).getPropertyValue("margin").slice(0, -2))
let slidesCount = 0
function slidesShow() {
    if (slidesCount < 0) {
        slidesCount = 2
    } else if (slidesCount > 2) {
        slidesCount = 0
    }
    slides.forEach(element => {
        element.style.cssText = `transform: translateX(-${slidesCount * shiftIndex}px)`
    })
}
function characterChange(n) {
    slidesCount += n
    slidesShow()
}
prev.addEventListener("click", () => {
    characterChange(-1)
})
next.addEventListener("click", () => {
    characterChange(1)
})
slidesShow()
let start = document.querySelector(".play")
let warningWindow = document.querySelector('.warning')
let warningText = document.querySelector('.warning-text')
function checkData() {
    sessionStorage.setItem("character", `${slidesCount}`)
    sessionStorage.setItem("name", nameInput.value)
    if (sessionStorage.getItem("name") == "") {
        warningWindow.style.cssText = "opacity: 1"
        warningText.textContent = "Вам нужно ввести имя"
    } else if (nameInput.value.length > 27) {
        warningWindow.style.cssText = "display: flex;"
        warningText.textContent = "Слишком длинное имя"
    } else {
        document.location.href = "game.html"
    }
}
start.addEventListener("click", () => {
    checkData()
})