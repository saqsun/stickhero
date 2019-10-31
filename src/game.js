let game;
let gameOptions = {
    platformGapRange: [200, 400],
    platformWidthRange: [100, 100],
    platformHeight: 600,
    playerWidth: 32,
    playerHeight: 64,
    poleWidth: 53,
    growTime: 500,
    rotateTime: 500,
    walkTime: 500,
    fallTime: 500,
    scrollTime: 250
};
const IDLE = 0;
const WAITING = 1;
const GROWING = 2;
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        width: 750,
        height: 1134,
        scene: [playGame],
        transparent: true
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
};
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload() {
        this.load.image("tile", "tile.png");
        this.load.image("tileWhite", "tileWhite.png");
        this.load.image("cloud_01", "cloud_01.png");
        this.load.image("cloud_02", "cloud_02.png");
        this.load.image("cloud_03", "cloud_03.png");
        this.load.image("ocean_tile", "ocean_tile.png");
        this.load.image("sun", "sun.png");
        this.load.image("pilar", "pilar.png");
        this.load.image("bridge_tile", "bridge_tile.png");
        this.load.image("preview", "preview.jpeg");
    }

    create() {
        // this.addPreview();
        this.addBackground();
        this.addPlatforms();
        this.addPlayer();
        this.addPole();
        this.input.on("pointerdown", this.grow, this);
        this.input.on("pointerup", this.stop, this);
        this.score = 0


    }
    addBackground() {
        this.sunSprite = this.add.sprite(520, 720, "sun");
        this.add.tileSprite(0, 450, 845, 361, "cloud_03").setOrigin(0);
        this.add.sprite(0, 650, "cloud_02").setOrigin(0);
        this.add.sprite(0, 750, "cloud_01").setOrigin(0);
        const oceanTile = this.add.sprite(0, 1134, "ocean_tile").setOrigin(0, 1);
        oceanTile.setScale(750 / oceanTile.width, 1);
        // this.add.sprite(520, 230, "cloud_02");
    }

    addPlatforms() {
        this.mainPlatform = 0;
        this.platforms = [];
        this.platforms.push(this.addPlatform(0));
        this.platforms.push(this.addPlatform(game.config.width));
        this.tweenPlatform();
    }

    addPlatform(posX) {
        let platform = this.add.sprite(
            posX,
            game.config.height - gameOptions.platformHeight,
            "pilar"
        );
        platform.displayWidth =
            (gameOptions.platformWidthRange[0] + gameOptions.platformWidthRange[1]) /
            2;
        platform.displayHeight = gameOptions.platformHeight;        
        platform.setOrigin(0, 0);
        return platform;
    }
    tweenPlatform() {
        let destination =
            this.platforms[this.mainPlatform].displayWidth +
            Phaser.Math.Between(
                gameOptions.platformGapRange[0],
                gameOptions.platformGapRange[1]
            );
        let size = Phaser.Math.Between(
            gameOptions.platformWidthRange[0],
            gameOptions.platformWidthRange[1]
        );
        this.tweens.add({
            targets: [this.platforms[1 - this.mainPlatform]],
            x: destination,
            displayWidth: size,
            duration: gameOptions.scrollTime,
            callbackScope: this,
            onComplete: function() {
                this.gameMode = WAITING;
            }
        });
    }
    addPlayer() {
        this.player = this.add.sprite(
            this.platforms[this.mainPlatform].displayWidth - gameOptions.poleWidth,
            game.config.height - gameOptions.platformHeight,
            "tile"
        );
        this.player.displayWidth = gameOptions.playerWidth;
        this.player.displayHeight = gameOptions.playerHeight;
        this.player.setOrigin(1, 1);

        this.bridgeGroup = this.add.container();
    }
    addPole() {
        this.pole = this.add.tileSprite(
            this.platforms[this.mainPlatform].displayWidth,
            game.config.height - gameOptions.platformHeight,
            gameOptions.poleWidth,
            gameOptions.playerHeight / 4,
            "bridge_tile"
        );
        this.pole.setOrigin(1, 1);
        // this.pole.displayWidth = gameOptions.poleWidth;
        // this.pole.displayHeight = gameOptions.playerHeight / 4;
    }
    grow() {
        if (this.gameMode == WAITING) {
            this.gameMode = GROWING;
            this.growTween = this.tweens.add({
                targets: [this.pole],
                height: gameOptions.platformGapRange[1] + gameOptions.platformWidthRange[1],
                duration: gameOptions.growTime
            });
        }
    }
    event() {

    }
    stop() {
        if (this.gameMode == GROWING) {
            this.gameMode = IDLE;
            this.growTween.stop();
            if (
                this.pole.displayHeight >
                this.platforms[1 - this.mainPlatform].x - this.pole.x
            ) {
                timedEvent = this.time.delayedCall(500, function() {
                    this.drawBridge(200, 0.7)
                    this.drawBridge(300, 0.4)

                    if (this.sunSprite.y > 100) {
                        this.tweens.add({
                            targets: this.sunSprite,
                            y: this.sunSprite.y - 50,
                            duration: 200,
                            callbackScope: this,
                            onComplete: function() {
                                //
                            }
                        });
                    }
                }, [], this);



                this.tweens.add({
                    targets: [this.pole],
                    angle: 90,
                    duration: gameOptions.rotateTime,
                    ease: "Bounce.easeOut",
                    callbackScope: this,
                    onComplete: function() {
                        if (
                            this.pole.displayHeight <
                            this.platforms[1 - this.mainPlatform].x +
                            this.platforms[1 - this.mainPlatform].displayWidth -
                            this.pole.x
                        ) {
                            this.tweens.add({
                                targets: [this.player],
                                x: this.platforms[1 - this.mainPlatform].x +
                                    this.platforms[1 - this.mainPlatform].displayWidth -
                                    this.pole.displayWidth,
                                duration: gameOptions.walkTime,
                                callbackScope: this,
                                onComplete: function() {
                                    this.tweens.add({
                                        targets: [
                                            this.player,
                                            this.pole,
                                            this.platforms[1 - this.mainPlatform],
                                            this.platforms[this.mainPlatform],
                                            this.bridgeGroup
                                        ],
                                        props: {
                                            x: {
                                                value: "-= " + this.platforms[1 - this.mainPlatform].x
                                            }
                                        },
                                        duration: gameOptions.scrollTime,
                                        callbackScope: this,
                                        onComplete: function() {
                                            this.prepareNextMove();
                                        }
                                    });
                                }
                            });
                        } else {
                            this.platformTooLong();
                        }
                    }
                });
            } else {
                this.platformTooShort();
            }
        }
    }
    platformTooLong() {
        this.tweens.add({
            targets: [this.player],
            x: this.pole.x + this.pole.displayHeight + this.player.displayWidth,
            duration: gameOptions.walkTime,
            callbackScope: this,
            onComplete: function() {
                this.fallAndDie();
            }
        });
    }
    platformTooShort() {
        this.tweens.add({
            targets: [this.pole],
            angle: 90,
            duration: gameOptions.rotateTime,
            ease: "Cubic.easeIn",
            callbackScope: this,
            onComplete: function() {
                this.tweens.add({
                    targets: [this.player],
                    x: this.pole.x + this.pole.displayHeight,
                    duration: gameOptions.walkTime,
                    callbackScope: this,
                    onComplete: function() {
                        this.tweens.add({
                            targets: [this.pole],
                            angle: 180,
                            duration: gameOptions.rotateTime,
                            ease: "Cubic.easeIn"
                        });
                        this.fallAndDie();
                    }
                });
            }
        });
    }
    fallAndDie() {
        this.tweens.add({
            targets: [this.player],
            y: game.config.height + this.player.displayHeight * 2,
            duration: gameOptions.fallTime,
            ease: "Cubic.easeIn",
            callbackScope: this,
            onComplete: function() {
                this.cameras.main.shake(800, 0.01);
                this.time.addEvent({
                    delay: 2000,
                    callbackScope: this,
                    callback: function() {
                        this.scene.start("PlayGame");
                    }
                });
            }
        });
    }
    prepareNextMove() {
        this.platforms[this.mainPlatform].x = game.config.width;
        this.mainPlatform = 1 - this.mainPlatform;
        this.tweenPlatform();
        this.pole.angle = 0;
        this.pole.x = this.platforms[this.mainPlatform].displayWidth;
        this.pole.height = gameOptions.poleWidth;
    }
    drawBridge(_height, _transparency) {
        let angle = 90
        let dd = 0
        var distance = this.platforms[1 - this.mainPlatform].x - this.platforms[this.mainPlatform].x
        /*
        var circle = this.add.circle(distance/2+distance/10, game.config.height - gameOptions.platformHeight-300, distance/2, 0x6666ff);
        this.bridgeGroup.add(circle)
        circle.visible = false
        */

        for (var i = 0; i <= 10; i++) {
            dd = Math.cos(i / 3.14)
            let pillar = this.add.sprite(
                this.platforms[this.mainPlatform].x + i * distance / 10 + distance / 10 - this.bridgeGroup.x,
                game.config.height - gameOptions.platformHeight,
                "tileWhite"
            );
            pillar.displayWidth = 10;
            pillar.displayHeight = 0
            pillar.alpha = _transparency;
            pillar.setOrigin(0, 0);
            pillar.setTint("0x940000")


            this.bridgeGroup.add(pillar)

            this.tweens.add({
                targets: pillar,
                displayHeight: -_height,
                duration: 200,
                callbackScope: this,
                onComplete: function() {
                    //
                }
            });
        }

        let horizontal = this.add.sprite(
            distance / 10 - this.bridgeGroup.x,
            game.config.height - gameOptions.platformHeight - _height,
            "tileWhite"
        );
        horizontal.displayWidth = 0
        horizontal.displayHeight = 10
        horizontal.alpha = _transparency;
        horizontal.setOrigin(0, 0);

        horizontal.setTint("0x6f0505")


        this.bridgeGroup.add(horizontal)

        this.tweens.add({
            targets: horizontal,
            displayWidth: distance,
            duration: 200,
            callbackScope: this,
            onComplete: function() {
                //
            }
        });




    }
}


function resize() {
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = windowWidth / gameRatio + "px";
    } else {
        canvas.style.width = windowHeight * gameRatio + "px";
        canvas.style.height = windowHeight + "px";
    }
}