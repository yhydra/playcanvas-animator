var AnimationBlending = pc.createScript('animationBlending');

AnimationBlending.states = {
    idle: {
        animation: 'male.json'
    },
    punch: {
        animation: 'male_uppercut_jab.json'
    }
};

// initialize code called once per entity
AnimationBlending.prototype.initialize = function() {
    this.blendTime = 0.2;

    this.setState('idle');

    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.keyDown, this);
    this.app.keyboard.on(pc.EVENT_KEYUP, this.keyUp, this);
};

AnimationBlending.prototype.setState = function (state) {
    var states = AnimationBlending.states;

    this.state = state;
    // Set the current animation, taking 0.2 seconds to blend from
    // the current animation state to the start of the target animation.
    this.entity.animation.play(states[state].animation, this.blendTime);
};

AnimationBlending.prototype.keyDown = function (e) {
    if ((e.key === pc.KEY_P) && (this.state !== 'punch')) {
        this.app.fire('animator:update', 'punch');
    }
};

AnimationBlending.prototype.keyUp = function (e) {
    if ((e.key === pc.KEY_P) && (this.state === 'punch')) {
        this.setState('idle');
    }
};
