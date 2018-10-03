# PlayCanvas Animator

This is a useful animator script that can be used similar fashion to the AvatarMask and Layers on Unity3d. 

## Usage

You can use this script solely by altering this script's attributes and simply hooking in to the PlayCanvas event system to interact with your new AnimatorControl component.

First, you need to assign the script to your player entity. This doesn't necesarilly have to be the entity with a mesh attribute, so you can use your collider entity parent (if you have) one, if you'd like.

![Attributes](https://i.imgur.com/RgXYRJh.png)

Set your "Skinned Mesh" to your mesh entity (probably a character of some sort), and your "Animation Entity" to the entity that contains an Animation component, marked with all of the animations you'll be utilizing for your character.

You'll also need to modify your root layer bones (Spine and Hips) based on your model's skeleton type. This will vary, and you may have to list all of the bones in your model to figure out the exact name of the spine and hip(s) bones.

If you don't know your model's bone structure, you can list all of it's bones by sending this event (which will log it's bone structure):

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
        this.app.fire('animator:update', 'punch');
    }
};

AnimationBlending.prototype.keyUp = function (e) {
    if ((e.key === pc.KEY_P) && (this.state === 'punch')) {
        this.setState('idle');
    }
};
```
## Table of Contents
[Roadmap](https://github.com/yhydra/playcanvas-animator/dev/production/roadmap.md)

