const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
console.log(window.innerWidth)
console.log(window.innerHeight)
document.querySelector("#interface").classList.add("active")
const gravity = 0.5
let playerStartPosition = {
    x: 0,
    y: 0
}
let flagStartPosition = {
    x: 0,
    y: 0
}
// Звуковые эффекты
let jumpSound = new Audio("sound/jump.mp3")
let damageSound = new Audio("sound/damage.mp3")
let coinSound = new Audio("sound/coin.mp3")
let finishSound = new Audio("sound/finish.mp3")
// Информация и характеристики
document.querySelector("#name").textContent = sessionStorage.getItem("name")
let character = Number(sessionStorage.getItem("character")) + 1
let level = "level_" + sessionStorage.getItem("levelCount")
let stop = 0
let score = Number(sessionStorage.getItem("score"))
let time = Number(sessionStorage.getItem("time"))
let health = 100
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
    "6                                                            '      ''        '4", //0
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
    "6             '                     '''              ''''       ''''           4", //0
    "6                                   <=>         ''   <==>       <==>    ''    '4", //1
    "6'     '''       '         <>   '                                      <==>   <4", //2
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
let tileSize = 96
let tileArr = []
function tileGenerator(level) {
    let image = new Image()
    image.src = "img/tiles.png"
    let trapImage = new Image()
    trapImage.src = "img/trap.png"
    class Tile {
        constructor(x, y, content) {
            this.position = {
                x: x,
                y: y
            }
            this.image = {
                width: tileSize,
                height: tileSize
            }
            this.content = content
        }
        draw() {    
            if (this.content == "0") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } if (this.content == "1") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "2") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "3") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "4") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "5") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "6") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "7") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "8") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "9") {
                c.drawImage(image, tileSize * Number(this.content) * 10, 0, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "I") {
                c.drawImage(image, tileSize * 0, tileSize * 10, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "O") {
                c.drawImage(image, tileSize * 10, tileSize * 10, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "J") {
                c.drawImage(image, tileSize * 20, tileSize * 10, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "K") {
                c.drawImage(image, tileSize * 30, tileSize * 10, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "." || this.content == ":") {
                c.drawImage(image, tileSize * 40, tileSize * 10, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "_") {
                c.drawImage(trapImage, 0 + 1000 * animateCount.run, 0, tileSize * 10, 600, this.position.x, this.position.y + tileSize / 2.2, this.image.width, this.image.height - tileSize / 2.2)
            } else if (this.content == "<") {
                c.drawImage(image, tileSize * 50, tileSize * 10, tileSize * 10 - 2, tileSize * 10 - 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "=") {
                c.drawImage(image, tileSize * 60, tileSize * 10, tileSize * 10 - 2, tileSize * 10 - 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == ">") {
                c.drawImage(image, tileSize * 70, tileSize * 10, tileSize * 10 - 2, tileSize * 10 - 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "M") {
                c.drawImage(image, tileSize * 0, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "L") {
                c.drawImage(image, tileSize * 10, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "H") {
                c.drawImage(image, tileSize * 20, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "R") {
                c.drawImage(image, tileSize * 30, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "T") {
                c.drawImage(image, tileSize * 40, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "V") {
                c.drawImage(image, tileSize * 50, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } else if (this.content == "B") {
                c.drawImage(image, tileSize * 60, tileSize * 20, tileSize * 10, tileSize * 10, this.position.x, this.position.y, this.image.width, this.image.height)
            } 
        }
    }
    let n = 0.0125
    let m = 0
    for (let i = 0; i < level.join("").length; i++) {
        tileArr.push(new Tile((i - m * 80) * tileSize, m * tileSize, level.join("").charAt(i)))
        if (Number.isInteger(n) == true) {
            m = n
        }
        n = parseFloat((n + 0.0125).toFixed(5))
    }
}
// Функция передачи координат спавна
function mapDecoder() {
    let n = 0
    tiles.forEach(tile => {
        if (tile.content == "P") {
            playerStartPosition.x = tile.position.x 
            playerStartPosition.y = tile.position.y
        } else if (tile.content == "F") {
            flagStartPosition.x = tile.position.x 
            flagStartPosition.y = tile.position.y
        } else if (tile.content == "E" ) {
            let direction
            if (Math.random() >= 0.5) {
                direction = "left"
            } else {
                direction = "right"
            }
            let startDelay = n + Math.round(Math.random() * 5)
            n++
            enemyArr.push(new Enemy(tile.position.x, tile.position.y - tileSize / 2.1, direction, startDelay))
        } else if (tile.content == "'" || tile.content == ":") {
            coinArr.push(new Coin(tile.position.x + tileSize / 6.4, tile.position.y + tileSize / 4.8))
        }
    })
}
tileGenerator(eval(level))
// Создание игрока
let playerImage = new Image()
playerImage.src = `img/char_${character}.png`
class Player {
    constructor() {
        this.position = {
            x: playerStartPosition.x + tileSize / 4 ,
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
        this.ability = {
            jump: false,
            drop: false
        }
        this.invincibility = false
        this.width = 50
        this.height = 100
    }
    draw() {
        let image = playerImage
        if (keys.right.pressed == true && keys.left.pressed == true) {
            c.drawImage(image, 3000 + animateCount.idle * 500, 0, 500, 500, this.position.x - 30, this.position.y - 20, this.image.width, this.image.height)
        } else if (this.collision.y == false) {
            if (this.direction.x == "left") {
                c.drawImage(image, 2500 + animateCount.jump * -500, 501, 500, 500, this.position.x  - 90, this.position.y - 20, this.image.width + 20, this.image.height)
            } else {
                c.drawImage(image, 3000 + animateCount.jump * 500, 501, 500, 500, this.position.x  - 55, this.position.y - 20, this.image.width + 20, this.image.height)
            }
        } else if (keys.right.pressed == true) {
            c.drawImage(image, 3000 + animateCount.run * 500, 1001, 500, 500, this.position.x  - 50, this.position.y - 20, this.image.width + 10, this.image.height)
        } else if (keys.left.pressed == true){
            c.drawImage(image, 2500 + animateCount.run * -500, 1001, 500, 500, this.position.x  - 80, this.position.y - 20, this.image.width + 10, this.image.height)
        } else {
            if(this.direction.x == "left") {
                c.drawImage(image, 2500 + animateCount.idle * -500, 0, 500, 500, this.position.x - 90, this.position.y - 20, this.image.width, this.image.height)
            } else {
                c.drawImage(image, 3000 + animateCount.idle * 500, 0, 500, 500, this.position.x - 30, this.position.y - 20, this.image.width, this.image.height)
            }
        }
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if (this.velocity.x > 0) {
            this.direction.x = "right"
        } else if (this.velocity.x < 0) {
            this.direction.x = "left"
        }
        if (this.velocity.y > 0) {
            this.direction.y = "down"
        } else if (this.velocity.y < 0 ) {
            this.direction.y = "up"
        }
        if (this.direction.y == "up" && keys.up.pressed == true) {
            this.ability.jump = false
        }
        if (this.direction.y == "up" && keys.up.pressed == true) {
            this.ability.jump = false
        }
        if (this.collision.y == true) {
            if (this.direction.y == "down") {
                if (keys.down.pressed == true && this.ability.drop == true && this.collision.y == true & this.direction.y == "down") {
                    this.position.y += 5
                    this.velocity.y = 1
                } else {
                    this.velocity.y = 0
                    if (this.position.y + this.height < tileSize * 9.5) {
                        this.position.y = Math.round(this.position.y / tileSize) * tileSize
                    }
                }
            } else {
                this.velocity.y = 1
            }
        } else {
            this.velocity.y += gravity
        }
        if (keys.right.pressed == true && keys.left.pressed == true) {
            this.velocity.x = 0
        } else if ((keys.right.pressed == true && player.position.x < 600) || (keys.right.pressed == true && scrollOffset == tileSize * 80 && this.position.x + this.width !== canvas.width)) {
            if (this.direction.x == "right" && this.collision.x == true) {
                this.velocity.x = 0
            } else {
                this.velocity.x = 5
            }
        } else if ((keys.left.pressed == true && player.position.x > 400) || (keys.left.pressed == true && scrollOffset == 0 && this.position.x >= 0)) {
            if (this.direction.x == "left" && this.collision.x == true) {
                this.velocity.x = 0
            } else {
                this.velocity.x = -5
            }
            
        } else {
            this.velocity.x = 0
            if (keys.right.pressed == true) {
                if (this.collision.x == false) {
                    scrollOffset += 5
                    flag.position.x -= 5
                    tiles.forEach(tile => {
                        if (this.direction.x == "right" && this.collision.x == false) {
                            tile.position.x -= 5
                        } 
                    })
                    enemies.forEach(enemy => {
                        if (this.direction.x == "right" && this.collision.x == false) {
                            enemy.position.x -= 5
                        } 
                    })
                    coins.forEach(coin => {
                        if (this.direction.x == "right" && this.collision.x == false) {
                            coin.position.x -= 5
                        } 
                    })
                }

            } else if (keys.left.pressed == true) {
                if (this.collision.x == false) {
                    scrollOffset -= 5
                    flag.position.x += 5
                    tiles.forEach(tile => {
                        if (this.direction.x == "left" && this.collision.x == false) {
                            tile.position.x += 5
                        } 
                    })
                    enemies.forEach(enemy => {
                        if (this.direction.x == "left" && this.collision.x == false) {
                            enemy.position.x += 5
                        } 
                    })
                    coins.forEach(coin => {
                        if (this.direction.x == "left" && this.collision.x == false) {
                            coin.position.x += 5
                        } 
                    })
                } 
            }
        }
        if (keys.up.pressed == true && this.ability.jump == true && this.collision.y == true && this.direction.y == "down") {
            this.velocity.y = -16
            jumpSound.play()
        }
        this.collision.x = false
        this.collision.y = false
        if (this.direction.y == "down") {
            if (this.position.y + this.height + this.velocity.y + 5 >= 953 && this.position.y < 953) {
                this.collision.y = true
                this.ability.jump = true
                this.ability.drop = false
            }
        }
        tiles.forEach(tile => {
            if (tile.content == "0") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "1") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "2") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
            } else if (tile.content == "3") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "4") {
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "6") {
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "7") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "8") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
            } else if (tile.content == "9") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "L") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "H") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
            } else if (tile.content == "R") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "T") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "V") {
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "B") {
                if (this.direction.y == "up") {
                    if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            }  else if (tile.content == "M") {
                if (this.position.y + this.velocity.y < tile.position.y + tileSize && this.position.y > tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                    this.collision.y = true
                }
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y  && this.position.y < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = false
                    }
                }
                if (this.direction.x == "right") {
                    if (this.position.x + this.width / 2 + 5 + this.velocity.x > tile.position.x && this.position.x < tile.position.x && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
                if (this.direction.x == "left") {
                    if (this.position.x - this.width / 2 - 5 + this.velocity.x < tile.position.x + tileSize && this.position.x > tile.position.x + tileSize && this.position.y + this.height - 5 > tile.position.y && this.position.y + this.height / 2 < tile.position.y + tileSize) {
                        this.collision.x = true
                    }
                }
            } else if (tile.content == "<") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y && this.position.y + this.height - 10 < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = true
                    }
                }
            } else if (tile.content == "=") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y && this.position.y + this.height - 10 < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = true
                    }
                }
            } else if (tile.content == ">") {
                if (this.direction.y == "down") {
                    if (this.position.y + this.height + this.velocity.y > tile.position.y && this.position.y + this.height - 10 < tile.position.y && this.position.x + this.width / 2 > tile.position.x && this.position.x - this.width / 2 < tile.position.x + tileSize) {
                        this.collision.y = true
                        this.ability.jump = true
                        this.ability.drop = true
                    }
                }
            }
        })
        enemies.forEach(enemy => {
            if (this.direction.x == "right") {
                if (this.position.x + this.width + this.velocity.x > enemy.position.x && this.position.x - this.width < enemy.position.x + enemy.width && this.position.y + this.height - 5 > enemy.position.y && this.position.y + this.height / 2 < enemy.position.y + enemy.height) {
                    enemy.attack = true
                } 
                else {
                    enemy.attack = false
                }
            }
            if (this.direction.x == "left") {
                if (this.position.x + this.velocity.x - 50 < enemy.position.x + enemy.width && this.position.x + this.width > enemy.position.x && this.position.y + this.height - 5 > enemy.position.y && this.position.y + this.height / 2 < enemy.position.y + enemy.height) {
                    enemy.attack = true
                } else {
                    enemy.attack = false
                }
            }
        })
        coins.forEach(coin => {
            if (this.direction.y == "up") {
                if (this.position.y + this.velocity.y < coin.position.y + coin.width && this.position.y > coin.position.y && this.position.x + this.width / 2 > coin.position.x && this.position.x - this.width / 2 < coin.position.x + coin.width) {
                    coin.collision = true
                }
            }
            if (this.direction.y == "down") {
                if (this.position.y + this.height + this.velocity.y > coin.position.y  && this.position.y < coin.position.y && this.position.x + this.width / 2 > coin.position.x && this.position.x - this.width / 2 < coin.position.x + coin.width) {
                    coin.collision = true
                }
            }
            if (this.direction.x == "right") {
                if (this.position.x + this.width + this.velocity.x > coin.position.x && this.position.x - this.width < coin.position.x + coin.width && this.position.y + this.height - 5 > coin.position.y && this.position.y + this.height / 2 < coin.position.y + coin.height) {
                    coin.collision = true
                } 
            }
            if (this.direction.x == "left") {
                if (this.position.x + this.velocity.x - 50 < coin.position.x + coin.width && this.position.x + this.width > coin.position.x && this.position.y + this.height - 5 > coin.position.y && this.position.y + this.height / 2 < coin.position.y + coin.height) {
                    coin.collision = true
                }
            }
        })
    }
}
// Создание финиша
let flagImage = new Image()
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
        let image = flagImage
        c.drawImage(image, 0 + animateCount.run * 500, 0, 300, 500, this.position.x + tileSize / 8, this.position.y - tileSize / 1.9, this.image.width, this.image.height)
    }
    update() {
        this.draw()
        if (player.direction.y == "up") {
            if (player.position.y + player.velocity.y < this.position.y + this.height && player.position.y > this.position.y && player.position.x + player.width / 2 > this.position.x && player.position.x - player.width / 2 < this.position.x + this.width) {
                nextLevel()
            }
        }
        if (player.direction.y == "down") {
            if (player.position.y + player.height + player.velocity.y > this.position.y  && player.position.y < this.position.y && player.position.x + player.width / 2 > this.position.x && player.position.x - player.width / 2 < this.position.x + this.width) {
                nextLevel()
            }
        }
        if (player.direction.x == "right") {
            if (player.position.x + player.width / 2 + 5 + player.velocity.x > this.position.x && player.position.x < this.position.x && player.position.y + player.height - 5 > this.position.y && player.position.y + player.height / 2 < this.position.y + this.height) {
                nextLevel()
            }
        }
        if (player.direction.x == "left") {
            if (player.position.x - player.width / 2 - 5 + player.velocity.x < this.position.x + this.width && player.position.x > this.position.x + this.width && player.position.y + player.height - 5 > this.position.y && player.position.y + player.height / 2 < this.position.y + this.height) {
                nextLevel()
            }
        }
    }
}
// Создание врагов
let enemyImage = new Image()
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
        this.width = 90
        this.height = 150
        this.range = 0
        this.delay = 0
        this.startDelay = n
        this.attack = false
        this.attackAnimateCount = 0
        this.direction = direction
        this.startPoint = x + this.width / 2
        this.border = {
            left: this.startPoint - tileSize * 3 + 20,
            right: this.startPoint + tileSize * 3 - 20
        }
    }
    draw() {
        let image = enemyImage
        if (this.attack == true) {
            if (this.direction == "right") {
                if (player.position.x + player.width / 2 > this.position.x + this.width / 2) {
                    c.drawImage(image, 3190 + animateCount.run * 540, 1260, 540, 1080, this.position.x + 5, this.position.y - 35, this.image.width * 1.5, this.image.height * 1.5)
                } else if (player.position.x + player.width / 2 < this.position.x + this.width / 2) {
                    c.drawImage(image, 2650 + animateCount.run* -540, 1260, 540, 1080, this.position.x - 50, this.position.y - 35, this.image.width * 1.5, this.image.height * 1.5)    
                }
            } else if (this.direction == "left") {
                if (player.position.x + player.width / 2 > this.position.x + this.width / 2) {
                    c.drawImage(image, 3190 + animateCount.run * 540, 1260, 540, 1080, this.position.x + 5, this.position.y - 35, this.image.width * 1.5, this.image.height * 1.5)
                } else if (player.position.x + player.width / 2 < this.position.x + this.width / 2) {
                    c.drawImage(image, 2650 + animateCount.run* -540, 1260, 540, 1080, this.position.x - 50, this.position.y - 35, this.image.width * 1.5, this.image.height * 1.5)    
                }
            }
        } else if (this.range == 268 || this.startDelay !== 0) {
            c.drawImage(image, 3190 + animateCount.idle * 540, 0, 320, 700, this.position.x, this.position.y - tileSize / 2.75, this.image.width, this.image.height)
        } else if (this.range == -268) {
            c.drawImage(image, 2870 + animateCount.idle * -540, 0, 320, 700, this.position.x, this.position.y - tileSize / 2.75, this.image.width, this.image.height)
        } else if (this.direction == "right") {
            c.drawImage(image, 3190 + animateCount.run * 540, 631, 320, 700, this.position.x, this.position.y - tileSize / 2.75, this.image.width, this.image.height)
        } else if (this.direction == "left") {
            c.drawImage(image, 2830 + animateCount.run* -540, 631, 320, 700, this.position.x - 10, this.position.y - tileSize / 2.75, this.image.width, this.image.height)
        }
    }
}
// Создание монет
let coinImage = new Image()
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
        let image = coinImage
        c.drawImage(image, 0 + animateCount.run * 240, 0, 240, 240, this.position.x, this.position.y - 5, this.image.width, this.image.height - 10)
    }
}
let keys = {
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
window.addEventListener("keydown", ({ keyCode }) => {
    switch (keyCode) {
        case 27:
            if (stop == 0) {
                stop = 1
                document.querySelector("#pause").style.cssText = "display: flex;"
                endGame()
            } else if (stop == 1) {
                stop = 0
                document.querySelector("#pause").style.cssText = ""
                startGame()
            }
            break
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
}
function jumpAnimation() {
    if (animateCount.jump == 3) {
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
        c.save()
        c.clearRect(0, 0, canvas.width, canvas.height)
        c.scale(innerWidth / 1920, innerHeight / 953)
        c.fillStyle = "#222a5c"
        c.fillRect(tileSize * 80 - scrollOffset, 0, 2000, 2000)
        tiles.forEach(tile => {
            tile.draw()
        })
        enemies.forEach(enemy => {
            enemy.draw()
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
        flag.update()
        player.update()
        healthCounter()
        scoreCounter()
        c.restore()
    }
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
        document.querySelector("#timer").textContent = `Время: ${timestamp}`
        enemies.forEach(enemy => {
            if (enemy.startDelay !== 0) {
                enemy.startDelay -= 1
            }
        })
    } 
}
timer()
// Функция урона
function healthCounter() {
        enemies.forEach(enemy => {
            if (enemy.attack == true && player.invincibility == false) {
                player.invincibility = true
                damageSound.play()
                health -= 20
                setTimeout(playerInvincibility, 1500)
            }
        })
        if (player.position.y + player.height + player.velocity.y + 5 > 953 && player.position.y < 953 && player.invincibility == false) {
            player.invincibility = true
            damageSound.play()
            health -= 20
            setTimeout(playerInvincibility, 1500)
        }
        document.querySelector("#health").textContent = `Здоровье: ${health} ОЗ`
        if (health == 0) {
            endGame()
            stop = 2
            document.querySelector("#lose").style.cssText = "display: flex;"
        }
}
// Функция очков
function scoreCounter() {
    if (stop == 0) {
        coins.forEach(coin => {
            if (coin.collision == true) {
                score += 100
                coinSound.play()
                delete coins[coins.indexOf(coin)]
            }
        })
        document.querySelector("#score").textContent = `Очки: ${score}`
        if (scrollOffset < tileSize * 80 - canvas.width){
            document.querySelector("#interface").style.cssText = "margin-left: auto;"
        }
    }
}
// Функция неуязвимости
function playerInvincibility() {
    player.invincibility = false
}
// Функция перехода на следующий уровень
function nextLevel() {
    sessionStorage.setItem("levelCount", `${Number(sessionStorage.getItem("levelCount")) + 1}`)
    stop = 2
    endGame(1)
}
// Функция сохранения информации
function saveData() {
    sessionStorage.setItem("score", `${score}`)
    sessionStorage.setItem("time", `${time}`)
    location.reload()
}
// Отслеживание кнопок для мобильных устройств
document.querySelector("#next").addEventListener("click", () => {
    saveData()
})
document.querySelector("#left").addEventListener("touchstart", () => {
    keys.left.pressed = true
})
document.querySelector("#left").addEventListener("touchend", () => {
    keys.left.pressed = false
})
document.querySelector("#right").addEventListener("touchstart", () => {
    keys.right.pressed = true
})
document.querySelector("#right").addEventListener("touchend", () => {
    keys.right.pressed = false
})
document.querySelector("#up").addEventListener("touchstart", () => {
    keys.up.pressed = true
})
document.querySelector("#up").addEventListener("touchend", () => {
    keys.up.pressed = false
})
document.querySelector("#down").addEventListener("touchstart", () => {
    keys.down.pressed = true
})
document.querySelector("#down").addEventListener("touchend", () => {
    keys.down.pressed = false
})
// Функция остановки игры
function endGame(n) {
    if (n == 1 && level !== "level_3") {
        finishSound.play()
        document.querySelector("#retry").style.cssText = "display: none;"
        document.querySelector("#next").style.cssText = "display: block;"
        document.querySelector("#pass").style.cssText = "display: block;"
    } else if (n == 1 && level == "level_3") {
        finishSound.play()
        document.querySelector("#next").style.cssText = "display: none;"
        document.querySelector("#retry").style.cssText = "display: none;"
        document.querySelector("#win").style.cssText = "display: flex;"
        sessionStorage.setItem("levelCount", "1")
        sessionStorage.setItem("score", "0")
        sessionStorage.setItem("time", "0")
    } else {
        document.querySelector("#next").style.cssText = "display: none;"
        document.querySelector("#retry").style.cssText = "display: block;"
    }
    document.querySelector("#buttons").style.cssText = "display: flex;"
    document.querySelector("#name").style.cssText = "text-align: center; margin-bottom: 10px;"
    document.querySelector("#stats").style.cssText = "flex-direction: row; margin-top: 20px; justify-content: space-evenly; text-align: center;"
    if (innerWidth <= 768) {
        document.querySelector("#interface").style.cssText = `width: ${innerWidth}; height: ${innerHeight};`

        document.querySelector("#interface").classList.remove("active")
    } else {
        document.querySelector("#interface").style.cssText = `width: 800px; height: 400px; border-radius: 25px; margin-top: ${276 * innerHeight / 953}px`
    }
    document.querySelector("canvas").style.cssText = "filter: blur(5px);"
}
// Функция начала игры
function startGame() {
    document.querySelector("#buttons").style.cssText = ""
    document.querySelector("#name").style.cssText = ""
    document.querySelector("#stats").style.cssText = ""
    document.querySelector("#interface").style.cssText = ""
    document.querySelector("#interface").classList.add("active")
    document.querySelector("canvas").style.cssText = ""
    animate()
}
setInterval(timer, 1000)
