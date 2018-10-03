# PlayCanvas Animator

This is a useful animator script that can be used similar fashion to the AvatarMask and Layers on Unity3d. 

## Usage

You can use this script by solely altering attributes and then simply hooking in to the PlayCanvas event system to interact with your new SkeletonBlend.

![Attributes](https://i.imgur.com/RgXYRJh.png)

Just alter these attributes based on your model. You can do that by sending this event (which will log your bone structure):

```
this.app.fire('bone:list');
```

And this will respond with something that looks similar to this (if you have a humanoid character:

[Insert Example Screenshot of Bone Listing]

Note that this will only work if the script is correctly attached to a MeshComponent and has the SkinnedMesh attribute ascribed.

## Examples

```
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
        this.app.fire('bone:update', 'punch');
    }
};

AnimationBlending.prototype.keyUp = function (e) {
    if ((e.key === pc.KEY_P) && (this.state === 'punch')) {
        this.setState('idle');
    }
};
```
