"use strict"
const canvas = select("canvas")
const ctx = canvas.getContext("2d")
const gravity = 0.5
const windowWidth = document.documentElement.clientWidth
const windowHeight = document.documentElement.clientHeight
function select(element, changes, method) {
    if (changes == undefined) {
        return document.querySelector(element)
    } else if (method == undefined) {
        document.querySelector(element).style.cssText = changes
    } else if (method == 0) {
        document.querySelector(element).classList.toggle(changes)
    } else if (method == 1) {
        document.querySelector(element).textContent = changes
    } else if (method == 2) {
        document.querySelector(element).classList.add(changes)
    } 
    else if (method == 3) {
        document.querySelector(element).classList.remove(changes)
    }
}
// Звуковые эффекты
const jumpSound = new Audio("sound/jump.mp3")
const damageSound = new Audio("sound/damage.mp3")
const coinSound = new Audio("sound/coin.mp3")
const finishSound = new Audio("sound/finish.mp3")
// Информация и характеристики
if (sessionStorage.getItem("name") == "") {
    select(".name", "Игрок", 1) 
} else {
    select(".name", sessionStorage.getItem("name"), 1) 
}
let character = Number(sessionStorage.getItem("character")) + 1
let level
if (sessionStorage.getItem("levelCount") == null) {
    level = "level_1"
} else {
    level = "level_" + sessionStorage.getItem("levelCount")
}
let stop = 0
let score = Number(sessionStorage.getItem("score"))
let time = Number(sessionStorage.getItem("time"))
let health = 5
let scrollOffset = 0
// Карта уровня
const map = [
    "6                                                                              4", //0
    "6                                                                              4", //1
    "6                                                                              4", //2
    "6                                                                              4", //3
    "6                                                                              4", //4
    "6                                                                              4", //5
    "6                                                                              4", //6
    "6                                                                              4", //7
    "6 P                                                                       123  4", //8
    "O2222222222222222222222222222222222222222222222222222222222222222222222222I5O22I"  //9
//  "12345123451234512345123451234512345123451234512345123451234512345123451234512345"
]
const level_1 = [
    "6'                    ''                              V                LHHHHHHH4", //0
    "6       '''          <==>    '       '     <>         B                :.:.:.:.4", //1
    "6'      <=>                 <=>         <>                       ''    :.:.:.:.4", //2
    "6             <>                     0   '      LHHR  '  LHHR   <==>   LHHR=LHH4", //3
    "6=>                              0       =            =    ::              '  '4", //4
    "6     '       <>             0                        '    LHR             '  '4", //5
    "6    <=>              ''  T               '           '                       <4", //6
    "6 <>               LHHHHHHV>             <=>                               F   4", //7
    "6 P  '         13  ..:.:.:V '      ' E '          ' 'E' '  123  ' 'E' '   123  4", //8
    "O2222223____122IO222222223B123___122222223______12222222222I5O222222222222I5O22I"  //9
//  "12345123451234512345123451234512345123451234512345123451234512345123451234512345"
]
const level_2 = [
    "3                                                            '      ''        '1", //0
    "6'   T                                                       '      <>       <=4", //1
    "6>   VHR=LHR           '        <>             <>                      '''     4", //2
    "6   'V         '''    <=>                            '       =        <===>   '4", //3
    "6   <V        LHHHR         <>         '''   <>     <=>   ' 'E' '             <4", //4
    "6'   V                                              ''    LHHHHHR   =   '     '4", //5
    "6>  'V       '''''''            ''    <===>        LHHR '               =     <4", //6
    "6   <V       '''''''     '      ''                    LHHHR>               F   4", //7
    "6 P  V       ''EEE''    <=>     13                    :::::       E   E   123  4", //8
    "O2222B223___122222223_________12IO23___0___0___12223__122223___12222222222I5O22I"  //9
//  "12345123451234512345123451234512345123451234512345123451234512345123451234512345"
]
const level_3 = [
    "3             '                     '''              ''''       ''''           4", //0
    "6                                   <=>         ''   <==>       <==>    ''  '  4", //1
    "6'     '''       '         <>   '                                      <==>    4", //2
    "6>   <=====>     '  ''   ''               =     ''         =                  '4", //3
    "6'               '       <>                     <>            '               <4", //4
    "6>      =       <=>              ''      '  =        =       <=>              '4", //5
    "6'                     <>        <>                                  '''      <4", //6
    "6>      =        =        =        =   <>            =   =           '''   F   4", //7
    "6 P                                                          '''      E   123  4", //8
    "O223____0________0________0________0________0________0_______123___1222222I5O22I"  //9
//  "12345123451234512345123451234512345123451234512345123451234512345123451234512345"
]
    // P — player spawnpoint
    // E — enemy spawnpoint
    // F — flag spawnpoint
    // ' — coin spawnpoint
    // : — coin on background spawnpoint

    // R — right platform 
    // H — horizontal platform tile
    // L — left platform tile
    // T — top platform tile
    // V — vertical platform tile
    // B — bottom platform tile
    // M — middle platform tile
    // . — background tile
    // _ — pit trap

    // < — right platform 
    // = — middle platform 
    // > — left platform 

    // 0 — ground tile
    // 1 — left-top ground tile
    // 2 — middle-top ground tile
    // 3 — right-top ground tile
    // 4 — left-middle ground tile
    // 5 — middle ground tile
    // 6 — right-middle ground tile
    // 7 — left-bottom ground tile
    // 8 — middle-bottom ground tile
    // 9 — right-bottom ground tile
    // I — left-top inner ground tile
    // O — right-top inner ground tile
    // J — left-bottom inner ground tile
    // K — right-bottom inner ground tile

// Характеристики клетки
let levelLength
const tileSize = 96
let tileArr = []
function tileGenerator(level) {
    const image = new Image()
    image.src = "img/tiles.png"
    const trapImage = new Image()
    trapImage.src = "img/trap.png"
    class Tile {
        constructor(x, y, type) {
            this.position = {
                x: x,
                y: y
            }
            this.image = {
                width: tileSize,
                height: tileSize
            }
            this.collision = {
                left: false,
                right: false,
                up: false,
                down: false,
                platform: false
            }
            this.type = type
        }
        draw(x, y, w, h, s, t, c) {  
            // x = this.position.x
            // y = this.position.y
            // w = this.image.width
            // h = this.image.height
            // s = 960  
            // t = this.type
            // c = this.collision
            if (x >= 0 - tileSize && x <= 1920) {
                if (t == "0") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.left = true; c.right = true; c.up = true; c.down = true
                } if (t == "1") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.left = true; c.up = true
                } else if (t == "2") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.up = true
                } else if (t == "3") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.right = true; c.up = true
                } else if (t == "4") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.left = true
                } else if (t == "5") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                } else if (t == "6") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.right = true
                } else if (t == "7") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.left = true; c.down = true
                } else if (t == "8") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h)
                    c.down = true
                } else if (t == "9") {
                    ctx.drawImage(image, s * Number(t), 0, s, s, x, y, w, h) 
                    c.right = true; c.down = true
                } else if (t == "I") {
                    ctx.drawImage(image, tileSize * 0, s, s, s, x, y, w, h)
                } else if (t == "O") {
                    ctx.drawImage(image, s, s, s, s, x, y, w, h)
                } else if (t == "J") {
                    ctx.drawImage(image, s * 2, s, s, s, x, y, w, h)
                } else if (t == "K") {
                    ctx.drawImage(image, s * 3, s, s, s, x, y, w, h)
                } else if (t == "." || t == ":") {
                    ctx.drawImage(image, s * 4, s, s, s, x, y, w, h)
                } else if (t == "_") {
                    ctx.drawImage(trapImage, 0 + 1000 * animateCount.run, -tileSize, s, 600, x, y + tileSize / 2.2, w, h - tileSize / 2.2)
                } else if (t == "<") {
                    ctx.drawImage(image, s * 5 + 5, s, s - 2, s - 10, x, y, w, h)
                    c.platform = true
                } else if (t == "=") {
                    ctx.drawImage(image, s * 6 + 5, s, s - 2, s - 10, x, y, w, h)
                    c.platform = true
                } else if (t == ">") {
                    ctx.drawImage(image, s * 7 + 5, s, s - 2, s - 10, x, y, w, h)
                    c.platform = true
                } else if (t == "M") {
                    ctx.drawImage(image, 0, s * 2, s, s, x, y, w, h)
                    c.left = true; c.right = true; c.up = true; c.down = true
                } else if (t == "L") {
                    ctx.drawImage(image, s, s * 2, s, s, x, y, w, h)
                    c.left = true; c.up = true; c.down = true
                } else if (t == "H") {
                    ctx.drawImage(image, s * 2, s * 2, s, s, x, y, w, h)
                    c.up = true; c.down = true
                } else if (t == "R") {
                    ctx.drawImage(image, s * 3, s * 2, s, s, x, y, w, h)
                    c.right = true; c.up = true; c.down = true
                } else if (t == "T") {
                    ctx.drawImage(image, s * 4, s * 2, s, s, x, y, w, h)
                    c.left = true; c.right = true; c.up = true
                } else if (t == "V") {
                    ctx.drawImage(image, s * 5, s * 2, s, s, x, y, w, h)
                    c.left = true; c.right = true
                } else if (t == "B") {
                    ctx.drawImage(image, s * 6, s * 2, s, s, x, y, w, h)
                    c.left = true; c.right = true; c.down = true
                } 
            }
        }
    }
    levelLength = level[0].length
    let n = 0.0125
    let m = 0
    for (let i = 0; i < level.join("").length; i++) {
        tileArr.push(new Tile((i - m * levelLength) * tileSize, m * tileSize, level.join("").charAt(i)))
        if (Number.isInteger(n) == true) {
            m = n
        }
        n = parseFloat((n + 0.0125).toFixed(5))
    }
}
let playerStartPosition = {
    x: 0,
    y: 0
}
let flagStartPosition = {
    x: 0,
    y: 0
}
// Функция передачи координат спавна
function mapDecoder() {
    let n = 0
    tiles.forEach(tile => {
        if (tile.type == "P") {
            playerStartPosition.x = tile.position.x 
            playerStartPosition.y = tile.position.y
        } else if (tile.type == "F") {
            flagStartPosition.x = tile.position.x 
            flagStartPosition.y = tile.position.y
        } else if (tile.type == "E" ) {
            let direction
            if (Math.random() >= 0.5) {
                direction = "left"
            } else {
                direction = "right"
            }
            let startDelay = n + Math.round(Math.random() * 5)
            n++
            enemyArr.push(new Enemy(tile.position.x, tile.position.y - tileSize / 2.1, direction, startDelay))
        } else if (tile.type == "'" || tile.type == ":") {
            coinArr.push(new Coin(tile.position.x + tileSize / 6.4, tile.position.y + tileSize / 4.8))
        }
    })
}
tileGenerator(eval(level))
// Создание игрока
const playerImage = new Image()
playerImage.src = `img/char_${character}.png`
class Player {
    constructor() {
        this.position = {
            x: playerStartPosition.x + tileSize / 4,
            y: playerStartPosition.y - tileSize / 2 
        }
        this.velocity = {
            x: 0,
            y: 1
        }
        this.direction = {
            x: "right",
            y: "down"
        }
        this.collision = {
            x: false,
            y: false
        }
        this.image = {
            width: 120,
            height: 120
        }
        this.jumpAbility = true
        this.jumpGap = false
        this.jumpDelay = 0
        this.invincibility = false
        this.width = 50
        this.height = 100
    }
    draw(p, d, s, w, h) {
        // p = this.position
        // d = this.direction
        // s = 500
        // w = this.image.width
        // h = this.image.height
        const image = playerImage
        if (keys.right.pressed == true && keys.left.pressed == true) {
            ctx.drawImage(image, s * 6 + animateCount.idle * s, 0, s, s, p.x - 30, p.y - 20, w, h)
        } else if (this.jumpAbility == false) {
            if (d.x == "left") {
                ctx.drawImage(image, s * 5 + animateCount.jump * -s, s + 5, s, s, p.x  - 90, p.y - 20, w + 20, h)
            } else {
                ctx.drawImage(image, s * 6 + animateCount.jump * s, s + 5, s, s, p.x  - 55, p.y - 20, w + 20, h)
            }
        } else if (keys.right.pressed == true) {
            ctx.drawImage(image, s * 6 + animateCount.run * s, s * 2 + 1, s, s, p.x  - 50, p.y - 20, w + 10, h)
        } else if (keys.left.pressed == true){
            ctx.drawImage(image, s * 5 + animateCount.run * -s, s * 2 + 1, s, s, p.x  - 80, p.y - 20, w + 10, h)
        } else {
            if(d.x == "left") {
                ctx.drawImage(image, s * 5 + animateCount.idle * -s, 0, s, s, p.x - 90, p.y - 20, w, h)
            } else {
                ctx.drawImage(image, s * 6 + animateCount.idle * s, 0, s, s, p.x - 30, p.y - 20, w, h)
            }
        }
    }
    update(p, v, d, c, w, h) {
        // p = this.position
        // v = this.velocity
        // d = this.direction
        // c = this.collision
        // w = this.width
        // h = this.height
        this.draw(p, d, 500, this.image.width, this.image.height)
        p.x += v.x
        p.y += v.y
        // Отслеживание направления
        if (v.x > 0) {
            d.x = "right"
        } else if (v.x < 0) {
            d.x = "left"
        }
        if (v.y > 0) {
            d.y = "down"
        } else if (v.y < 0 ) {
            d.y = "up"
        }
        if (d.y == "up" && keys.up.pressed == true) {
            this.jumpAbility = false
        }
        if (d.y == "up" && keys.up.pressed == true) {
            this.jumpAbility = false
        }
        // Выравнивание персонажа по высоте
        if (c.y == true) {
            if (d.y == "down") {
                this.jumpGap = true
                v.y = 0
                if (p.y + h < tileSize * 9.5) {
                    p.y = Math.round(p.y / tileSize) * tileSize
                }
            } else {
                v.y = 1
            }
        } else {
            v.y += gravity
        }
        // Промежуток для прыжка после схождения с платформы
        if (this.jumpDelay == 3) {
            this.jumpGap = false
        }
        // Движение персонажа или окружения
        if (keys.right.pressed == true && keys.left.pressed == true) {
            v.x = 0
        } else if ((keys.right.pressed == true && p.x < 600) || (keys.right.pressed == true && scrollOffset == tileSize * levelLength && p.x + w !== canvas.width)) {
            if (d.x == "right" && c.x == true) {
                v.x = 0
            } else {
                v.x = 5
            }
        } else if ((keys.left.pressed == true && p.x > 400) || (keys.left.pressed == true && scrollOffset == 0 && p.x >= 0)) {
            if (d.x == "left" && c.x == true) {
                v.x = 0
            } else {
                v.x = -5
            }
        } else {
            v.x = 0
            if (keys.right.pressed == true) {
                if (c.x == false) {
                    scrollOffset += 5
                    flag.position.x -= 5
                    tiles.forEach(tile => {
                        if (d.x == "right" && c.x == false) {
                            tile.position.x -= 5
                        } 
                    })
                    enemies.forEach(enemy => {
                        if (d.x == "right" && c.x == false) {
                            enemy.position.x -= 5
                        } 
                    })
                    coins.forEach(coin => {
                        if (d.x == "right" && c.x == false) {
                            coin.position.x -= 5
                        } 
                    })
                }

            } else if (keys.left.pressed == true) {
                if (c.x == false) {
                    scrollOffset -= 5
                    flag.position.x += 5
                    tiles.forEach(tile => {
                        if (d.x == "left" && c.x == false) {
                            tile.position.x += 5
                        } 
                    })
                    enemies.forEach(enemy => {
                        if (d.x == "left" && c.x == false) {
                            enemy.position.x += 5
                        } 
                    })
                    coins.forEach(coin => {
                        if (d.x == "left" && c.x == false) {
                            coin.position.x += 5
                        } 
                    })
                } 
            }
        }
        if (keys.up.pressed == true && this.jumpAbility == true && this.jumpGap == true && d.y == "down") {
            v.y = -16
            jumpSound.play()
        }
        // Отслеживание столкновений
        c.x = false
        c.y = false
        if (d.y == "down") {
            if (p.y + h + v.y + 5 >= 953 && p.y < 953) {
                c.y = true
                this.jumpAbility = true
            }
        }
        tiles.forEach(tile => {
            if (tile.position.x >= 0 - tileSize && tile.position.x <= 1920) {
                if (tile.collision.up == true) {
                    if (p.y + h + v.y > tile.position.y  && p.y < tile.position.y && p.x + w / 2 > tile.position.x && p.x - w / 2 < tile.position.x + tileSize) {
                        c.y = true
                        this.jumpAbility = true
                    }
                }
                if (tile.collision.down == true) {
                    if (p.y + v.y < tile.position.y + tileSize && p.y > tile.position.y && p.x + w / 2 > tile.position.x && p.x - w / 2 < tile.position.x + tileSize) {
                        c.y = true
                    }
                }
                if (tile.collision.right == true) {
                    if (p.x - w / 2 - 5 + v.x < tile.position.x + tileSize && p.x > tile.position.x + tileSize && p.y + h - 5 > tile.position.y && p.y + h / 2 < tile.position.y + tileSize) {
                        c.x = true
                    }
                }
                if (tile.collision.left == true) {
                    if (p.x + w / 2 + 5 + v.x > tile.position.x && p.x < tile.position.x && p.y + h - 5 > tile.position.y && p.y + h / 2 < tile.position.y + tileSize) {
                        c.x = true
                    }
                }
                if (tile.collision.platform == true && keys.down.pressed == false) {
                    if (p.y + h + v.y > tile.position.y && p.y + h - 10 < tile.position.y && p.x + w / 2 > tile.position.x && p.x - w / 2 < tile.position.x + tileSize) {
                        c.y = true
                        this.jumpAbility = true
                    }
                }
            }
        })
        enemies.forEach(enemy => {
            if (d.x == "right") {
                if (p.x + w + v.x > enemy.position.x && p.x - w < enemy.position.x + enemy.width && p.y + h - 5 > enemy.position.y && p.y + h / 2 < enemy.position.y + enemy.height) {
                    enemy.attack = true
                    if (enemy.attackStart == true) {
                        enemy.attackStart = false
                    }
                } 
                else {
                    enemy.attack = false
                    if (enemy.attackAnimateCount == 0) {
                        setTimeout(enemy.attackStart = true, 10)
                    }
                }
            }
            if (d.x == "left") {
                if (p.x + v.x - 50 < enemy.position.x + enemy.width && p.x + w > enemy.position.x && p.y + h - 5 > enemy.position.y && p.y + h / 2 < enemy.position.y + enemy.height) {
                    enemy.attack = true
                    if (enemy.attackStart == true) {
                        enemy.attackStart = false
                    }
                } 
                else {
                    enemy.attack = false
                    if (enemy.attackAnimateCount == 0) {
                        setTimeout(enemy.attackStart = true, 10)
                    }
                }
            }
        })
        coins.forEach(coin => {
            if (d.y == "up") {
                if (p.y + v.y < coin.position.y + coin.width && p.y > coin.position.y && p.x + w / 2 > coin.position.x && p.x - w / 2 < coin.position.x + coin.width) {
                    coin.collision = true
                }
            }
            if (d.y == "down") {
                if (p.y + h + v.y > coin.position.y  && p.y < coin.position.y && p.x + w / 2 > coin.position.x && p.x - w / 2 < coin.position.x + coin.width) {
                    coin.collision = true
                }
            }
            if (d.x == "right") {
                if (p.x + w + v.x > coin.position.x && p.x - w < coin.position.x + coin.width && p.y + h - 5 > coin.position.y && p.y + h / 2 < coin.position.y + coin.height) {
                    coin.collision = true
                } 
            }
            if (d.x == "left") {
                if (p.x + v.x - 50 < coin.position.x + coin.width && p.x + w > coin.position.x && p.y + h - 5 > coin.position.y && p.y + h / 2 < coin.position.y + coin.height) {
                    coin.collision = true
                }
            }
        })
        if (d.y == "up") {
            if (p.y + v.y < flag.position.y + flag.height && p.y > flag.position.y && p.x + w / 2 > flag.position.x && p.x - w / 2 < flag.position.x + flag.width) {
                nextLevel()
            }
        }
        if (d.y == "down") {
            if (p.y + player.height + v.y > flag.position.y  && p.y < flag.position.y && p.x + w / 2 > flag.position.x && p.x - w / 2 < flag.position.x + flag.width) {
                nextLevel()
            }
        }
        if (d.x == "right") {
            if (p.x + w / 2 + 5 + v.x > flag.position.x && p.x < flag.position.x && p.y + h - 5 > flag.position.y && p.y + h / 2 < flag.position.y + flag.height && stop == 0) {
                nextLevel()
            }
            if (p.x + w / 2 + 5 + v.x > levelLength * tileSize - scrollOffset) {
                c.x = true
            }
        }
        if (d.x == "left") {
            if (p.x - w / 2 - 5 + v.x < flag.position.x + flag.width && p.x > flag.position.x + flag.width && p.y + h - 5 > flag.position.y && p.y + h / 2 < flag.position.y + flag.height && stop == 0) {
                nextLevel()
            }
            if (p.x - w / 2 - 5 + v.x < 0) {
                c.x = true
            }
        }
    }
}
// Функция проверки прыжка
function jumpCheck() {
    if (player.jumpDelay == 3 || player.collision.y == true) {
        player.jumpDelay = 0
    } else {
        player.jumpDelay++
    } 
}
setInterval(jumpCheck, 20)
// Создание финиша
const flagImage = new Image()
flagImage.src = "img/flag.png"
class Flag {
    constructor() {
        this.position = {
            x: flagStartPosition.x + tileSize / 5,
            y: flagStartPosition.y
        }
        this.image = {
            width: 90,
            height: 150
        }
        this.width = 60
        this.height = 100
    }
    draw() {
        const image = flagImage
        ctx.drawImage(image, 0 + animateCount.run * 500, 0, 300, 500, this.position.x + tileSize / 8, this.position.y - tileSize / 1.9, this.image.width, this.image.height)
    }
}
// Создание врагов
const enemyImage = new Image()
enemyImage.src = `img/enemy.png`
let enemyArr = []
class Enemy {
    constructor(x, y, direction, n) {
        this.position = {
            x: x, 
            y: y
        }
        this.image = {
            width: 100,
            height: 200
        }
        this.collision = {
            left: false,
            right: false
        }
        this.width = 70
        this.height = 140
        this.range = 0
        this.delay = 0
        this.startDelay = n
        this.attack = false
        this.attackStart = false
        this.attackAnimateCount = 0
        this.direction = direction
        this.startPoint = x + this.width / 2
        this.border = {
            left: this.startPoint - tileSize * 3 + 20,
            right: this.startPoint + tileSize * 3 - 20
        }
    }
    draw(p, d, s, w, h) {
        // p = this.position
        // d = this.direction
        // c = this.collision
        // w = this.image.width
        // h = this.image.height
        const image = enemyImage
        if (this.attack == true || (this.attackAnimateCount < 6 && this.attackStart == false)) {
            if (d == "right") {
                if (player.position.x + player.width / 2 > p.x + this.width / 2) {
                    ctx.drawImage(image, s * 6 - 51 + this.attackAnimateCount * s, 1265, s, s * 2, p.x + 5, p.y - 35, w * 1.55, h * 1.55)
                } else if (player.position.x + player.width / 2 < p.x + this.width / 2) {
                    ctx.drawImage(image, s * 5 - 51 + this.attackAnimateCount * -s, 1265, s, s * 2, p.x - 50, p.y - 35, w * 1.55, h * 1.55)    
                }
            } else if (d == "left") {
                if (player.position.x + player.width / 2 > p.x + this.width / 2) {
                    ctx.drawImage(image, s * 6 - 51 + this.attackAnimateCount * s, 1265, s, s * 2, p.x + 5, p.y - 35, w * 1.55, h * 1.55)
                } else if (player.position.x + player.width / 2 < p.x + this.width / 2) {
                    ctx.drawImage(image, s * 5 - 51 + this.attackAnimateCount * -s, 1265, s, s * 2, p.x - 50, p.y - 35, w * 1.55, h * 1.55)    
                }
            }
        } else if (this.range == 268 || this.startDelay !== 0) {
            ctx.drawImage(image, s * 6 - 50 + animateCount.idle * s, 0, 320, 700, p.x, p.y - tileSize / 2.75, w, h)
        } else if (this.range == -268) {
            ctx.drawImage(image, 2870 + animateCount.idle * -s, 0, 320, 700, p.x, p.y - tileSize / 2.75, w, h)
        } else if (d == "right") {
            ctx.drawImage(image, s * 6 - 50 + animateCount.run * s, 635, 320, 700, p.x, p.y - tileSize / 2.75, w, h)
        } else if (d == "left") {
            ctx.drawImage(image, 2830 + animateCount.run* -s, 635, 320, 700, p.x - 10, p.y - tileSize / 2.75, w, h)
        }
    }
}
// Создание монет
const coinImage = new Image()
coinImage.src = `img/coin.png`
let coinArr = []
class Coin {
    constructor(x, y) {
        this.position = {
            x: x, 
            y: y
        }
        this.image = {
            width: 80,
            height: 80
        }
        this.collision = false
        this.width = 50
        this.height = 50
    }
    draw() {
        const image = coinImage
        ctx.drawImage(image, 0 + animateCount.run * 240, 0, 240, 240, this.position.x, this.position.y - 5, this.image.width, this.image.height - 10)
    }
}
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
}
// Отслеживание нажатий клавиш
window.addEventListener("keydown", ({ keyCode }) => {
    switch (keyCode) {
        case 65:
            keys.left.pressed = true
            break
        case 37:
            keys.left.pressed = true
            break
        case 83:
            keys.down.pressed = true
            break
        case 40:
            keys.down.pressed = true
            break
        case 68:
            keys.right.pressed = true
            break
        case 39:
            keys.right.pressed = true
            break
        case 87:
            keys.up.pressed = true
            break
        case 38:
            keys.up.pressed = true
            break
        case 32: 
            keys.up.pressed = true
            break
    }
})
window.addEventListener("keyup", ({ keyCode }) => {
    switch (keyCode) {
        case 65:
            keys.left.pressed = false
            break
        case 37:
            keys.left.pressed = false
            break
        case 83:
            keys.down.pressed = false
            break
        case 40:
            keys.down.pressed = false
            break
        case 68:
            keys.right.pressed = false
            break
        case 39:
            keys.right.pressed = false
            break
        case 87:
            keys.up.pressed = false
            break
        case 38:
            keys.up.pressed = false
            break
        case 32: 
            keys.up.pressed = false
            break
    }
})
window.addEventListener('keydown', (event) => {
    if (event.code == 'Escape') {
        if (stop == 0) {
            stop = 1
            select(".stop", "display: flex;")
            endGame()
        } else if (stop == 1) {
            stop = 0
            select(".stop", "")
            startGame()
        }
    }
})
let respawn = true
window.addEventListener("keydown", ({ keyCode }) => {
    if (keyCode == 82) {
        if (respawn == true && (player.collision.y == true || player.collision.x == true) && player.velocity.y !== 0) {
            player.position.y -= 200
            player.velocity.y = 0
        }
        if ((player.collision.y == true || player.collision.x == true) && player.velocity.y !== 0) {
            respawn = false
        }
    }
})
const tiles = tileArr
mapDecoder()
const player = new Player()
const flag = new Flag()
const coins = coinArr
const enemies = enemyArr
// Счётчики анимаций
let animateCount = {
    idle: 0,
    run: 0,
    jump: 0
}
function idleAnimation() {
    if (animateCount.idle == 3) {
        animateCount.idle = 0
    } else {
        animateCount.idle++
    } 
}
function runAnimation() {
    if (animateCount.run == 5) {
        animateCount.run = 0
    } else {
        animateCount.run++
    } 
    enemies.forEach(enemy => {
        if (enemy.attackAnimateCount == 5 || enemy.attackStart == true) {
            enemy.attackAnimateCount = 0
        } else {
            enemy.attackAnimateCount++
        }
        
    })
}
function jumpAnimation() {
    if (animateCount.jump == 3 || player.jumpAbility == true) {
        animateCount.jump = 0
    } else {
        animateCount.jump++
    } 
}
setInterval(idleAnimation, 300)
setInterval(runAnimation, 100)
setInterval(jumpAnimation, 100)
// Основная анимация
function animate() {
    if (stop == 0) {
        requestAnimationFrame(animate)
    }
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(document.documentElement.clientWidth / 1920, document.documentElement.clientHeight / 953)
    ctx.fillStyle = "#222a5c"
    ctx.fillRect(tileSize * levelLength - scrollOffset - 1, 0, 2000, 2000)
    tiles.forEach(tile => {
        tile.draw(tile.position.x, tile.position.y, tile.image.width, tile.image.height, 960, tile.type, tile.collision)
    })
    player.update(player.position, player.velocity, player.direction, player.collision, player.width, player.height)
    // Передвижение врагов
    enemies.forEach(enemy => {
        enemy.draw(enemy.position, enemy.direction, 540, enemy.image.width, enemy.image.height)
        if (enemy.startDelay == 0) {
            if (enemy.direction == "right" && enemy.attack == false) {
                if (enemy.startPoint < enemy.border.right - enemy.range) {
                    enemy.position.x += 2
                    enemy.range += 2
                } else {
                    if (enemy.delay > 600) {
                        enemy.direction = "left"
                        enemy.delay = 0

                    } else {
                        enemy.delay += 1
                    }
                }
            } else if (enemy.direction == "left" && enemy.attack == false) {
                if (enemy.startPoint > enemy.border.left - enemy.range) {
                    enemy.position.x -= 2
                    enemy.range -= 2
                } else {
                    if (enemy.delay > 600) {
                        enemy.direction = "right"
                        enemy.delay = 0
                    } else {
                        enemy.delay += 1
                    }
                }
            }
        }
    })
    coins.forEach(coin => {
        coin.draw()
    })    
    flag.draw()
    healthCounter()
    scoreCounter()
    ctx.restore()
}
animate()
// Функция таймера
function timer() {
    if (stop == 0) {
        let hours = Math.floor(time / 360)
        let minutes = Math.floor(time / 60 - hours * 60)
        let seconds = time % 60
        let timestamp = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0")
        ].join(":")
        time += 1
        select(".timer", `Время: ${timestamp}`, 1)
        enemies.forEach(enemy => {
            if (enemy.startDelay !== 0) {
                enemy.startDelay -= 1
            }
        })
        respawn = true
    } 
}
timer()
setInterval(timer, 1000)
// Функция урона
function healthCounter() {
        enemies.forEach(enemy => {
            if (enemy.attack == true && player.invincibility == false && enemy.attackAnimateCount > 1) {
                player.invincibility = true
                damageSound.play()
                health -= 1
                setTimeout(playerInvincibility, 1500)
            }
        })
        if (player.position.y + player.height + player.velocity.y + 5 > 953 && player.position.y < 953 && player.invincibility == false) {
            player.invincibility = true
            damageSound.play()
            health -= 1
            setTimeout(playerInvincibility, 1500)
        }
        for (let i = 0; i < 5 - health; i++) {
            select(`.health>img:nth-child(${i + 1})`, "display: none;")
        }
        if (health == 0 && stop == 0) {
            endGame()
            stop = 2
            select(".lose", "display: flex;")
        }
}
// Функция счётчика очков
function scoreCounter() {
    if (stop == 0) {
        coins.forEach(coin => {
            if (coin.collision == true) {
                score += 1
                coinSound.play()
                delete coins[coins.indexOf(coin)]
            }
        })
        select(".score", `Очки: ${score}00`, 1)
    }
}
// Функция неуязвимости
function playerInvincibility() {
    player.invincibility = false
}
// Функция перехода на следующий уровень
function nextLevel() {
    stop = 2
    sessionStorage.setItem("levelCount", `${Number(sessionStorage.getItem("levelCount")) + 1}`)
    endGame(1)
}
// Функция сохранения информации
function saveData() {
    sessionStorage.setItem("score", `${score}`)
    sessionStorage.setItem("time", `${time}`)
    location.reload()
}
// Отслеживание кнопок для мобильных устройств
let buttons = {
    left: select(".left"),
    right: select(".right"),
    up: select(".up"),
    down: select(".down")
}
select(".next").addEventListener("click", () => {
    saveData()
})
buttons.left.addEventListener("touchstart", () => {
    keys.left.pressed = true
    buttons.left.classList.toggle("pressed")
})
buttons.left.addEventListener("touchend", () => {
    keys.left.pressed = false
    buttons.left.classList.toggle("pressed")
})
buttons.right.addEventListener("touchstart", () => {
    keys.right.pressed = true
    buttons.right.classList.toggle("pressed")
})
buttons.right.addEventListener("touchend", () => {
    keys.right.pressed = false
    buttons.right.classList.toggle("pressed")
})
buttons.up.addEventListener("touchstart", () => {
    keys.up.pressed = true
    buttons.up.classList.toggle("pressed")
})
buttons.up.addEventListener("touchend", () => {
    keys.up.pressed = false
    buttons.up.classList.toggle("pressed")
})
buttons.down.addEventListener("touchstart", () => {
    keys.down.pressed = true
    buttons.down.classList.toggle("pressed")
})
buttons.down.addEventListener("touchend", () => {
    keys.down.pressed = false
    buttons.down.classList.toggle("pressed")
})

select(".pause").addEventListener("touchstart", () => {
    select(".pause", "pressed", 0)
})
select(".pause").addEventListener("touchend", () => {
    if (stop == 0) {
        stop = 1
        select(".stop", "display: flex;")
        endGame()
    } else if (stop == 1) {
        stop = 0
        select(".stop", "")
        startGame()
    }
    select(".pause", "pressed", 0)
})
// Функция остановки игры
function endGame(n) {
    if (n == 1 && level !== "level_3") {
        finishSound.play()
        select(".retry", "display: none;")
        select(".next", "display: flex;")
        select(".pass", "display: flex;")
    } else if (n == 1 && level == "level_3") {
        finishSound.play()
        select(".next", "display: none;")
        select(".retry", "display: none;")
        select(".win", "display: flex;")
        sessionStorage.setItem("score", "0")
        sessionStorage.setItem("time", "0")
    } else {
        select(".next", "display: none;")
        select(".retry", "display: block;")
    }
    select(".buttons", "display: flex;")
    select(".interface", "active", 2)
    select("canvas", "filter: blur(5px);")
    select(".health", "display: none;")
}
// Функция начала игры
function startGame() {
    select(".buttons", "")
    select(".interface", "active", 3)
    select("canvas", "")
    select(".health", "")
    animate()
}
// Функция адаптивности
let reload = false
function isMobile() {
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
    if ((canvas.width !== windowWidth || canvas.height !== windowHeight) && reload == false) {
        location.reload()
        reload = true
    }
    if (navigator.maxTouchPoints > 0 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent) == true) {
        if (document.documentElement.clientHeight > document.documentElement.clientWidth) {
            stop = 2
            select(".warning", `display: flex; width: ${document.documentElement.clientWidth}px; height: ${document.documentElement.clientHeight}px;`)
        }
        if (select(".interface").classList.contains("active") == false) {
            select(".controls", `display: flex; width: ${document.documentElement.clientWidth}px; height: ${document.documentElement.clientHeight}px;`)
            select(".controls-bottom", "")
            select(".health", `margin-right: ${220 * document.documentElement.clientWidth / 1920 * 2}px`)
            select(".interface", `transform: scale(${document.documentElement.clientWidth / 1920 * 2}); transform-origin: right top;`)
        } else {
            select(".controls-bottom", "display: none;")
            select(".active", `transform: scale(${document.documentElement.clientWidth / 1920 * 2});`)
        }
        
    }
}    
setInterval(isMobile, 1)