var Entity = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.spdX = 0;
    self.spdY = 0;
    self.direction = initPack.direction;
    self.width = initPack.width;
    self.height = initPack.height;
    self.type = initPack.type;
    self.map = initPack.map;
    self.interpolationStage = 3;
    self.fade = 0;
    self.fadeState = 0;
    if(!initPack.new){
        self.fade = 1;
        self.fadeState = 1;
    }
    if(initPack.toRemove){
        self.fade = 0;
        self.fadeState = 2;
    }
    self.toRemove = false;
    self.updated = true;
    self.update = function(){
        if(self.interpolationStage > 0){
            if(self.spdX >= 0.25 && self.spdX <= 0.5){
                self.x += 0.6;
                self.spdX = 0;
            }
            else if(self.spdX <= -0.25 && self.spdX >= -0.5){
                self.x -= 0.6;
                self.spdX = 0;
            }
            else{
                self.x += self.spdX;
            }
            if(self.spdY >= 0.25 && self.spdY <= 0.5){
                self.y += 0.6;
                self.spdY = 0;
            }
            else if(self.spdY <= -0.25 && self.spdY >= -0.5){
                self.y -= 0.6;
                self.spdY = 0;
            }
            else{
                self.y += self.spdY;
            }
            self.x = Math.round(self.x);
            self.y = Math.round(self.y);
        }
        self.interpolationStage -= 1;
    }
	self.getSquareDistance = function(pt){
		return Math.max(Math.abs(Math.floor(self.x - pt.x)),Math.abs(Math.floor(self.y - pt.y))) / 64;
    }
    self.isColliding = function(pt){
        if(pt.x + pt.width / 2 <= self.x - self.width / 2){
            return false;
        }
        if(pt.x - pt.width / 2 >= self.x + self.width / 2){
            return false;
        }
        if(pt.y + pt.height / 2 <= self.y - self.height / 2){
            return false;
        }
        if(pt.y - pt.height / 2 >= self.y + self.height / 2){
            return false;
        }
        return true;
    }
    return self;
}

var Actor = function(initPack){
    var self = Entity(initPack);
    self.img = initPack.img;
    self.name = initPack.name;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.drawSize = initPack.drawSize;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.canAttack = initPack.canAttack;
    self.stats = initPack.stats;
    self.team = initPack.team;
    self.showHealthBar = initPack.showHealthBar;

    self.render = renderPlayer(self.img,self.drawSize);

    self.drawName = function(){
        ctx.font = "15px pixel";
        ctx.fillStyle = '#00ff90';
        ctx.textAlign = "center";
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 17;
        }
        else{
            var yDistance = 16;
        }
        if(self.showHealthBar === false){
            ctx.fillText(self.name,Math.round(self.x),Math.round(self.y - yDistance * 4 - 4));
        }
        else{
            ctx.fillText(self.name,Math.round(self.x),Math.round(self.y - yDistance * 4 - 32));
        }
    }
    self.drawHp = function(){
        if(self.fadeState !== 1){
            if(self.fade <= 0){
                return;
            }
            ctx.globalAlpha = self.fade;
        }
        if(self.name !== ''){
            self.drawName();
        }
        if(self.showHealthBar === false){
            return;
        }
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 16;
        }
        else{
            var yDistance = 16;
        }
        if(self.team === Player.list[selfId].team){
            ctx.drawImage(Img.healthbar,0,4,16,4,Math.round(self.x - 32),Math.round(self.y - yDistance * 4 - 20),64,16);
            ctx.drawImage(Img.healthbar,1,1,Math.round(14 * self.hp / self.hpMax),2,Math.round(self.x - 28),Math.round(self.y - yDistance * 4 - 16),Math.round(14 * self.hp / self.hpMax) * 4,8);
        }
        else{
            ctx.drawImage(Img.healthbar,0,20,16,4,Math.round(self.x - 32),Math.round(self.y - yDistance * 4 - 20),64,16);
            ctx.drawImage(Img.healthbar,1,17,Math.round(14 * self.hp / self.hpMax),2,Math.round(self.x - 28),Math.round(self.y - yDistance * 4 - 16),Math.round(14 * self.hp / self.hpMax) * 4,8);
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    return self;
}

var Player = function(initPack){
    var self = Actor(initPack);
    self.level = initPack.level;
    self.currentItem = initPack.currentItem;
    self.debuffs = initPack.debuffs;
    self.draw = function(){
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Player.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Player.list[self.id];
                    return;
                }
            }
        }
        if(Item.list[self.currentItem]){
            if(Item.list[self.currentItem].displayItem === true){
                ctx.save();
                ctx.translate(self.x,self.y);
                ctx.rotate((self.direction - 225) / 180 * Math.PI);
                var drawId = Item.list[self.currentItem].drawId;
                var img_x = ((drawId - 1) % 26) * 24;
                var img_y = ~~((drawId - 1) / 26) * 24;
                ctx.drawImage(Img.items2,img_x,img_y,24,24,-96,-96,96,96);
                ctx.restore();
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Player.list[self.id] = self;
    return self;
}
Player.list = {};
var Projectile = function(initPack){
    var self = Entity(initPack);
    self.spdDirection = 0;
    self.projectileType = initPack.projectileType;
    self.parent = initPack.parent;
    self.parentType = initPack.parentType;
    self.relativeToParent = initPack.relativeToParent;
    self.collisionType = initPack.collisionType;
    self.animations = initPack.animations;
    self.animation = initPack.animation;
    if(self.relativeToParent){
        self.fade = 1;
        self.fadeState = 1;
    }
    else{
        self.fade = 0.5;
    }

    if(Item.list[self.projectileType]){
        self.render = new OffscreenCanvas(24,24);
        var renderCtx = self.render.getContext("2d");
        resetCanvas(renderCtx);
        var drawId = Item.list[self.projectileType].drawId;
        var img_x = ((drawId - 1) % 26) * 24;
        var img_y = ~~((drawId - 1) / 26) * 24;
        renderCtx.drawImage(Img.items2,img_x,img_y,24,24,0,0,24,24);
    }

    self.update = function(){
        if(self.interpolationStage > 0){
            self.x += self.spdX;
            self.y += self.spdY;
            self.direction += self.spdDirection;
        }
        if(self.fadeState === 2){
            self.x += self.spdX;
            self.y += self.spdY;
            self.spdX = self.spdX * 0.5;
            self.spdY = self.spdY * 0.5;
        }
        self.interpolationStage -= 1;
    }
    self.draw = function(){
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Projectile.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Projectile.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        if(Img[self.projectileType]){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.rotate(self.direction * Math.PI / 180);
            ctx.drawImage(Img[self.projectileType],self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
            ctx.restore();
        }
        else if(Item.list[self.projectileType]){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.rotate(self.direction * Math.PI / 180);
            ctx.drawImage(self.render,self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
            ctx.restore();
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};
var Monster = function(initPack){
    var self = Actor(initPack);
    self.monsterType = initPack.monsterType;
    if(self.monsterType === 'teneyedone'){
        startBossSong('tenEyedOne');
    }
    self.draw = function(){
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                if(self.monsterType === 'teneyedone'){
                    stopBossSong('tenEyedOne');
                }
                delete Monster.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    if(self.monsterType === 'teneyedone'){
                        stopBossSong('tenEyedOne');
                    }
                    delete Monster.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};
var Npc = function(initPack){
    var self = Actor(initPack);
    self.draw = function(){
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Npc.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Npc.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Npc.list[self.id] = self;
    return self;
}
Npc.list = {};

var HarvestableNpc = function(initPack){
    var self = Entity(initPack);
    self.img = initPack.img;
    self.harvestHp = 0;
    self.harvestHpMax = 0;
    self.drawLayer0 = function(){
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete HarvestableNpc.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete HarvestableNpc.list[self.id];
                    return;
                }
            }
        }
        if(Img[self.img + '0']){
            if(self.height === 64){
                ctx.drawImage(Img[self.img + '0'],self.x - self.width / 2,self.y - self.height / 2,self.width,self.height);
            }
            else{
                ctx.drawImage(Img[self.img + '0'],self.x - self.width / 2,self.y,self.width,self.height / 2);
            }
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawLayer1 = function(){
        if(self.height === 64){
            return;
        }
        if(settings.entityFadeOut === true){
            if(self.fadeState === 0){
                ctx.globalAlpha = self.fade;
            }
            else if(self.fadeState === 1){

            }
            else{
                ctx.globalAlpha = self.fade;
            }
        }
        if(Img[self.img + '1']){
            ctx.drawImage(Img[self.img + '1'],self.x - self.width / 2,self.y - self.height / 2,self.width,self.height / 2);
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawHp = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
        }
        else if(self.fadeState === 1){

        }
        else{
            ctx.globalAlpha = self.fade;
        }
        ctx.drawImage(Img.healthbar,0,12,16,4,Math.round(self.x - 32),Math.round(self.y) - self.height / 2 - 20,64,16);
        ctx.drawImage(Img.healthbar,1,9,Math.round(14 * self.harvestHp / self.harvestHpMax),2,Math.round(self.x - 28),Math.round(self.y) - self.height / 2 - 16,Math.round(14 * self.harvestHp / self.harvestHpMax) * 4,8);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    if(self.img !== 'none'){
        HarvestableNpc.list[self.id] = self;
    }
    return self;
}
HarvestableNpc.list = {};

var selected = false;

var DroppedItem = function(initPack){
    var self = Entity(initPack);
    self.item = initPack.item;
    if(!Item.list[self.item]){
        return;
    }
    self.amount = initPack.amount;
    self.parent = initPack.parent;
    self.allPlayers = initPack.allPlayers;
    if(self.parent + '' !== selfId + '' && self.allPlayers === false){
        return
    }
    self.render = new OffscreenCanvas(48,48);
    self.renderSelect = new OffscreenCanvas(48,48);
    var renderCtx = self.render.getContext("2d");
    var renderSelectCtx = self.renderSelect.getContext("2d");
    resetCanvas(renderCtx);
    resetCanvas(renderSelectCtx);
    var drawId = Item.list[self.item].drawId;
    var img_x = ((drawId - 1) % 26) * 24;
    var img_y = ~~((drawId - 1) / 26) * 24;
    renderCtx.drawImage(Img.items2,img_x,img_y,24,24,0,0,48,48);
    renderSelectCtx.drawImage(Img.items2select,img_x,img_y,24,24,0,0,48,48);
    self.draw = function(){
        if(Player.list[selfId].x + mouseX > self.x - 24 && Player.list[selfId].x + mouseX < self.x + 24 && Player.list[selfId].y + mouseY > self.y - 24 && Player.list[selfId].y + mouseY < self.y + 24 && selected === false && inGame === true){
            ctx.drawImage(self.renderSelect,self.x - 24,self.y - 24);
            selected = true;
            itemMenu.innerHTML = getEntityDescription(self);
            itemMenu.style.display = 'inline-block';
            var rect = itemMenu.getBoundingClientRect();
            itemMenu.style.left = '';
            itemMenu.style.right = '';
            itemMenu.style.top = '';
            itemMenu.style.bottom = '';
            if(rawMouseX + rect.right - rect.left > window.innerWidth){
                itemMenu.style.right = window.innerWidth - rawMouseX + 'px';
            }
            else{
                itemMenu.style.left = rawMouseX + 'px';
            }
            if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
                itemMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
            }
            else{
                itemMenu.style.top = rawMouseY + 'px';
            }
        }
        else{
            ctx.drawImage(self.render,self.x - 24,self.y - 24);
        }
        if(self.amount !== 1){
            ctx.font = "13px pixel";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(self.amount,Math.round(self.x + 24),Math.round(self.y + 24));
        }
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};

var Particle = function(initPack){
    var self = Entity(initPack);
    self.id = Math.random();
    self.x = initPack.x += 16 * (Math.random() * 2 - 1);
    self.y = initPack.y += 16 * (Math.random() * 2 - 1);
    self.spdX = Math.random() * 6 - 3;
    self.spdY = Math.random() * -4;
    self.direction = Math.random() * 360;
    self.spdDirection = Math.random() * 2;
    self.opacity = 0.9;
    self.update = function(){
        self.x += self.spdX;
        self.y += self.spdY;
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.spdY += 0.1;
        self.spdX *= 0.99;
        self.direction += self.spdDirection;
        self.direction = Math.round(self.direction);
        self.opacity -= 0.01;
        if(self.map !== Player.list[selfId].map){
            self.toRemove = true;
        }
        if(self.opacity <= 0){
            self.toRemove = true;
        }
    }
    self.draw = function(){
        if(initPack.particleType === 'death'){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.rotate(self.direction * Math.PI / 180);
            ctx.fillStyle = 'rgba(234,50,60,' + self.opacity + ')';
            ctx.fillRect(-8,-8,16,16);
            ctx.restore();
        }
        if(initPack.particleType === 'damage'){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "35px pixel";
            if(initPack.value >= 0){
                ctx.fillStyle = 'rgba(234,50,60,' + self.opacity + ')';
                ctx.fillText('-' + initPack.value,0,0);
            }
            else{
                ctx.fillStyle = 'rgba(90,197,79,' + self.opacity + ')';
                ctx.fillText('+' + initPack.value,0,0);
            }
            ctx.restore();
        }
        if(initPack.particleType === 'critDamage'){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "55px pixel";
            if(initPack.value >= 0){
                ctx.fillStyle = 'rgba(234,50,60,' + self.opacity * 2 + ')';
                ctx.fillText('-' + initPack.value,0,0);
            }
            else{
                ctx.fillStyle = 'rgba(90,197,79,' + self.opacity * 2 + ')';
                ctx.fillText('+' + initPack.value,0,0);
            }
            ctx.restore();
        }
    }
    Particle.list[self.id] = self;
}
Particle.list = {};

Particle.create = function(x,y,map,particleType,number,value){
    if(!tabVisible){
        return;
    }
    var newNumber = Math.ceil(number * settings.particlesPercentage / 100);
    for(var i = 0;i < newNumber;i++){
        new Particle({
            x:x,
            y:y,
            map:map,
            value:value,
            particleType:particleType,
        });
    }
}