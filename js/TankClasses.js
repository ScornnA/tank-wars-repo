class BaseTank 
{
    maxSpeed = 100;
    damageMax = 2;
    constructor(scene, x, y, texture) 
    {
        this.scene = scene;
        //shadow
        this.shadow = this.scene.physics.add.sprite(x, y, texture, 'shadow'); 
        this.shadow.setDepth(1);
        //hull
        this.hull = this.scene.physics.add.sprite(x, y, texture, 'tank1');
        this.hull.setDepth(2);
        this.hull.body.setSize(this.hull.width - 8, this.hull.height - 8);
        this.hull.body.bounce.setTo(1, 1);
        this.hull.body.collideWorldBounds = true;
        //turrets
        this.turret = this.scene.physics.add.sprite(x, y, texture, 'turret');
        this.turret.setDepth(4);

        this.damageCount = 0;


    }
    update() 
    {
        this.shadow.x = this.turret.x = this.hull.x;
        this.shadow.y = this.turret.y = this.hull.y;
        this.shadow.rotation = this.hull.rotation;
    }
    enableCollision(layer) 
    {
        this.scene.physics.add.collider(this.hull, layer);
    }
    burn() 
    {
        this.turret.setVisible(false);
        this.hull.setVelocity(0);
        this.hull.body.immovable = true;
    }
    isDestroyed() 
    {
        if (this.damageCount >= this.damageMax) 
        {
            return true;
        }
    }
    isImmobilised() 
    {
        if (this.damageCount >= this.damageMax - 1) 
        {
            return true;
        }
    }
    setBullets(bullets) 
    {
        this.bullets = bullets;
    }
}
class EnemyTank extends BaseTank 
{
    tankSpeed = 100;
    shotInterval = 2000;

    constructor(scene, x, y, texture, player) 
    {
        super(scene, x, y, texture);
        this.player = player;
        this.hull.angle = Phaser.Math.RND.angle();
        this.nextShot = 0;
    }

    initMvt() 
    {
        this.scene.physics.velocityFromRotation(this.hull.rotation, this.tankSpeed, this.hull.body.velocity);
    }

    update(time, delta) 
    {
        super.update();
        this.turret.rotation = Phaser.Math.Angle.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y);
        this.hull.rotation = Math.atan2(this.hull.body.velocity.y, this.hull.body.velocity.x);
        if (!this.isImmobilised() && Phaser.Math.Distance.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y) < 300) {
            if (this.nextShot > time) {
                return
            }
            this.nextShot = time + this.shotInterval;
            let bullet = this.bullets.get(this.turret.x, this.turret.y);
            if (bullet) {
                this.scene.fireBullet(bullet, this.turret.rotation, this.player);
            }
        }
    }

    damage() 
    {
        this.damageCount++;
        if (this.damageCount >= this.damageMax) {
            this.turret.destroy();
            this.hull.destroy();
        } else if (this.damageCount == this.damageMax - 1) {
            this.burn();
        }
    }
}

class PlayerTank extends BaseTank 
{
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);
        this.currentSpeed = 0;
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        });        
        this.damageMax = 10;

    }
    update() 
    {
        if (this.keys.w.isDown) {
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += 10;
            }
        }
        else if (this.keys.s.isDown) {
            if (this.currentSpeed > -this.maxSpeed) {
                this.currentSpeed -= 10;
            }
        } else {
            if (this.currentSpeed > 3) {
                this.currentSpeed -= 3;
            } else if (this.currentSpeed < -3) {
                this.currentSpeed += 3;
            } else {
                this.currentSpeed = 0;
            }
        }
        if (this.keys.a.isDown) {
            if (this.currentSpeed > 0) {
                this.hull.angle--;
            } else {
                this.hull.angle++;
            }
        } else if (this.keys.d.isDown) {
            if (this.currentSpeed > 0) {
                this.hull.angle++;
            } else {
                this.hull.angle--;
            }
        }
        this.scene.physics.velocityFromRotation(this.hull.rotation, this.currentSpeed, this.hull.body.velocity);
        super.update();

        let worldPointer = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, worldPointer.x, worldPointer.y);


    }
    damage() 
    {
        this.scene.cameras.main.shake(200, 0.005);
        this.damageCount++;
        if (this.damageCount >= this.damageMax) {
            this.burn();
        }
    }
}