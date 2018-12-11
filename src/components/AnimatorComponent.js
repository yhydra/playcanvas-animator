/* jshint esversion: 6 */
var AnimatorControl = pc.createScript('AnimatorControl');

AnimatorControl.attributes.add('skinnedMesh', {type: 'entity', default: 0, title: 'Skinned Mesh'});
AnimatorControl.attributes.add('animationEntity', {type: 'entity', default: 0, title: 'Animation Entity'});

AnimatorControl.attributes.add('spineBone', {type: 'string', default: 'SpineBone', title: 'Spine Bone'});
AnimatorControl.attributes.add('hipBone', {type: 'string', default: 'HipsBone', title: 'Hip Bone'});

AnimatorControl.attributes.add('debug', {type: 'boolean', default: false, title: 'Debug Mode?'});

var lowerLayerMask= [
    'LeftFoot',
    'RightFoot',
    'Hips',
    'LeftLeg',
    'RightLeg',
    'LeftToeBase',
    'RightToeBase',
    'LeftUpLeg',
    'RightUpLeg'
];

var upperLayerMask = [
    'Neck',
    'LeftShoulder', 
    'RightShoulder', 
    'Spine',
    'Spine1', 
    'LeftForearm', 
    'RightForearm',
    'LeftHand',
    'RightHand',
    'Head',
    'LeftArm',
    'RightArm',
    'Spine2' // Chest
];

var tempUpperBone;
var tempLowerBone;

// We'll loop through these to get the bones we'll filter.
var bones = { };
var skins;

// Skeleton ID for input to update anim trigger or not
var upperLayerRootBone = 'Spine'; // this.spineBone;
var lowerLayerRootBone = 'Hips'; // this.hipBone;

// initialize code called once per entity
AnimatorControl.prototype.initialize = function() {
    
    // INITIALIZE SKIN/BONES
    skins = this.skinnedMesh.model.model.skinInstances;
    
    for(var s = 0; s < skins.length; s++) {
        for(var b = 0; b < skins[s].bones.length; b++) {
            bones[skins[s].bones[b].name] = skins[s].bones[b];

            // This is some other code designed to loop through the spine and hip bones so you don't have to custom set the bones, but it's inoperational atm
    //         if(skins[s].bones[b].name == this.spineBone) {
    //             tempUpperBone = skins[s].bones[b];
    //             upperLayerMask = [];

    //             for(var t = 0; t < tempUpperBone.length; t++) {
    //                 upperLayerMask.append(tempUpperBone[t]);
    //             }
    //         }

    //         if(skins[s].bones[b].name == this.hipBone) {
    //             tempLowerBone = skins[s].bones[b];
    //             lowerLayerMask = [];

    //             for(var t = 0; t < tempLowerBone.length; t++) {
    //                 lowerLayerMask.append(tempLowerBone[t]);
    //             }
    //         }
        }
    }
    
    
    
    
    
    
    
    
    
    // Make sure we actually have an entity with our animation component
    if(!this.animationEntity) {
        console.log("Animator: You must define an entity where an animation component with animations is defined!");
        return;
    }
    
    // This is where we'll store all of the current animation's data
    this.layers = [];
    this.frames = []; // Not used atm, but will be used for blending, I expect.
    
    //var reload = { id: 'reload', anim: this.skinnedMesh.animation.data.animations.IdleReloading };
    
    // Hardcode defined animations, if necessary, but it's preferable to just let the component define it.
    
    /*
    let idle = { 'id':'idle', anim:this.skinnedMesh.animation.data.animations.swordIdle };
    let run = { 'id':'run', anim:this.skinnedMesh.animation.data.animations.swordRun };
    let slash = { 'id':'slash', anim:this.skinnedMesh.animation.data.animations.swordSlash };
    */
    
    this.animations = this.entity.animation.data.animations;
    var reloadAnim = this.entity.animation.getAnimation('IdleReloading');
    window.reload = this.CreateLayerAnim(upperLayerMask, 'reload', reloadAnim);
    
    // Unfortunately we have to define all of these globally, 
    // which is inefficient and really unnecessary, but there's no other way to implement it
//     for(var key in animations) {
//         window[key] = this.CreateLayerAnim(upperLayerMask, "" + key, key); // Here we are saying (if key is for instance, monkey, window.monkey = {id: 'monkey', anim: animations.monkey }
        
//         this.layers.push(this.CreateAvatarAnim(upperLayerRootBone, upperLayerMask, window[key])); // Here we'll define the animation
//     }
    
    //this.layers.push(this.CreateAvatarAnim(upperLayerRootBone, upperLayerMask, slash));
    //this.layers.push(this.CreateAvatarAnim(lowerLayerRootBone, lowerLayerMask, run));
    this.layers.push(this.CreateAvatarAnim(upperLayerRootBone, upperLayerMask, window.reload));
    
};

AnimatorControl.prototype.CreateLayerAnim = (layer, id, anim) => {
    return  { 'layer': layer, 'id': id, 'anim': anim };
};

AnimatorControl.prototype.CreateSkeleton = function(rootBone, skinnedMesh, targetBones) {
    let boneGraph = skinnedMesh.model.model.getGraph();
    let rootBoneNodes = boneGraph.findByName(rootBone);
    
    var bones = { };
    var thisGraph = [];
    
    var skins = skinnedMesh.model.model.skinInstances;
    
    for(var s = 0; s < skins.length; s++) {
        for(var b = 0; b < skins[s].bones.length; b++) {
            bones[skins[s].bones[b].name] = skins[s].bones[b];
        }
    }
    
    for(let index in targetBones) {
        let boneNode = targetBones[index];
        
        for(let xindex in bones) {
            let bone = bones[xindex];
            if(bone.name == boneNode) {
                thisGraph.push(bone);
            }
        }
    }
    
    let rootBoneSkeleton = new pc.Skeleton(rootBoneNodes);
    rootBoneSkeleton.setGraph(rootBoneNodes);
    
    console.log('Animator: Skeleton Created ', rootBoneSkeleton);
    
    rootBoneSkeleton.boneGraph = thisGraph;
    return rootBoneSkeleton;
};

AnimatorControl.prototype.CreateAvatarAnim = function(rootBone, targetBones, animObject, animation){ 
    //create a new skeleton and set it to the skinned mesh entity
    
    //set its graph to the nodes from the spine and further down
    let thisSkeleton = this.CreateSkeleton(rootBone, this.skinnedMesh, targetBones);
    
    //set its new animation clip which will only contain relevant nodes to the spine and further down
    this.layerSkeletonAnimClip = new pc.Animation();
    
    //grab the nodes from the animation
    const layerSkeletonNodes = animObject.anim.nodes; //animObject.anim._nodes;
    
    // //Filter the animation nodes into a new array to be added into the new animation clip array
    var relevantFilteredNodes = layerSkeletonNodes.filter(function(node) {
        for(var index in targetBones) {
            let skelNode = targetBones[index];
            if(node._name == skelNode) {
                return node;
            }
        }
    });
    
    // Loop through our filtered nodes and add the filtered animation nodes into the new animation clip
    for(let index in relevantFilteredNodes) {
        let node = relevantFilteredNodes[index];
        
        if(index != "binaryIndexOf"){
            this.layerSkeletonAnimClip.addNode(node);
        }
    }
    
    // //name the newly created clip
    this.layerSkeletonAnimClip.name = animObject.id;
    
    //add its duration
    this.layerSkeletonAnimClip.duration = animObject.anim.duration;
    
    //add the newly created clip to the upper body skeleton
    thisSkeleton.animation = this.layerSkeletonAnimClip;
    
    thisSkeleton.updateAnim = false;
    thisSkeleton.targetBones = targetBones;
    thisSkeleton.id = animObject.id;
    
        this.app.on('animator' + ':' + this.animationEntity.name + ':' + animObject.id,() => {
            if(Math.abs(thisSkeleton.currentTime, thisSkeleton.animation.duration) < 0.01) {
                thisSkeleton.updateAnim =! thisSkeleton.updateAnim;
                
            }
        });
    
    return thisSkeleton;
};

AnimatorControl.prototype.TriggerAnim = function(id) {
    this.layers.find((layer) => {
       if(layer.id == id) {
           layer.updateAnim =! layer.updateAnim;
           
           if(this.debug) console.log('Animator [DEBUG]: Layer Updated', layer.updateAnim);
       } 
    });
};

// EVENT CODE //
AnimatorControl.prototype.onSkeletonList = function() {
    console.log("Animator: Bone List");
    console.log("-------------------");
    
    if(skins === undefined) {
        console.log("You must define the skinned model before you can use the AnimatorControl component!");
    }
    
    for(var s = 0; s < skins.length; s++) {
        for(var b = 0; b < skins[s].bones.length; b++) {
            console.log(skins[s].bones[b]);
        }
    }
};



// UPDATE code called every frame //
AnimatorControl.prototype.postUpdate = function(dt) {
    for(let index in this.layers) {
        let skeletonLayer = this.layers[index];
        
        if(this.debug) console.log('Animator [DEBUG]: ', skeletonLayer);
        
        if(skeletonLayer.updateAnim)  {
            skeletonLayer.addTime(dt * 2);
            skeletonLayer.updateGraph();
            
            if(Math.abs(skeletonLayer.currentTime, skeletonLayer.animation.duration) < 0.01) {
                skeletonLayer.updateAnim = false;
                this.app.fire('animator:' + this.animationEntity.name + ':end:' + skeletonLayer.id);
            }
        }
    }
};
