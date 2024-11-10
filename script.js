"use strict"
function select(element, method) {
    if (method == undefined) {
        return document.querySelector(element)
    } else {
        return document.querySelectorAll(element)
    }
} 
const nameInput = select(".name-input")
window.onload = function reset() {
    sessionStorage.setItem("character", "")
    nameInput.value = ""
    sessionStorage.setItem("score", "0")
    sessionStorage.setItem("time", "0")
    sessionStorage.setItem("levelCount", "1")
}
const slides = select(".character-item", 0)
const shiftIndex = slides[0].offsetWidth + 2 * Number(window.getComputedStyle(slides[0], null).getPropertyValue("margin").slice(0, -2))
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
select(".prev").addEventListener("click", () => {
    characterChange(-1)
})
select(".next").addEventListener("click", () => {
    characterChange(1)
})
slidesShow()
select(".play").addEventListener("click", () => {
    sessionStorage.setItem("character", `${slidesCount}`)
    sessionStorage.setItem("name", nameInput.value)
    location.href = "game.html"
})