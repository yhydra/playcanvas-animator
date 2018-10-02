/*jshint esversion: 6*/
var AnimatorControl = pc.createScript('animatorControl');

AnimatorControl.attributes.add('skinnedMesh', {type: 'entity', default: 0, title: 'Skinned Mesh'});

AnimatorControl.attributes.add('spineBone', {type: 'string', default: 'SpineBone', title: 'Spine Bone'});
AnimatorControl.attributes.add('hipBone', {type: 'string', default: 'HipsBone', title: 'Hip Bone'});

var lowerLayerMask= [
    'Foot_Left_jnt',
    'Foot_Right_jnt',
    'Hips_jnt',
    'LowerLeg_Left_jnt',
    'LowerLeg_Right_jnt',
    'Toe_Left_jnt',
    'Toe_Right_jnt',
    'UpperLeg_Left_jnt',
    'UpperLeg_Right_jnt'
];

var upperLayerMask = [
    'Neck_jnt',
    'Shoulder_Left_jnt', 
    'Shoulder_Right_jnt', 
    'Spine_jnt',
    'Spine_jnt1', 
    'Forearm_Left_jnt', 
    'Forearm_Right_jnt',
    'Hand_Left_jnt',
    'Hand_Right_jnt',
    'Head_jnt',
    'Arm_Left_jnt',
    'Arm_Right_jnt',
    'Chest_jnt'
];

var tempUpperBone;
var tempLowerBone;

var bones = { };
var skins = skinMesh.model.model.skinInstances;

for(var s = 0; s < skins.length; s++) {
    for(var b = 0; b < skins[s].bones.length; b++) {
        bones[skins[s].bones[b].name] = skins[s].bones[b];
        
        if(skins[s].bones[b].name == this.spineBone) {
            tempUpperBone = skins[s].bones[b];
            upperLayerMask = [];
            
            for(var t = 0; t < tempUpperBone.length; t++) {
                upperLayerMask.append(tempUpperBone[t]);
            }
        }
        
        if(skins[s].bones[b].name == this.hipBone) {
            tempLowerBone = skins[s].bones[b];
            lowerLayerMask = [];
            
            for(var t = 0; t < tempLowerBone.length; t++) {
                lowerLayerMask.append(tempLowerBone[t]);
            }
        }
    }
}

//skeleton ID for input to update anim trigger or not
var upperLayerRootBone = this.spineBone;
var lowerLayerRootBone = this.hipBone;

// initialize code called once per entity
AnimatorControl.prototype.initialize = function() {

    this.layers=[];
    this.frames=[];
    let idle = { 'id':'idle', anim:this.skinnedMesh.animation.data.animations.swordIdle };
    let run = { 'id':'run', anim:this.skinnedMesh.animation.data.animations.swordRun };
    let slash = { 'id':'slash', anim:this.skinnedMesh.animation.data.animations.swordSlash };
    
    this.layers.push(this.CreateAvatarAnim(upperLayerRootBone, upperLayerMask, slash));
    //this.layers.push(this.CreateAvatarAnim(lowerLayerRootBone, lowerLayerMask,run));
};

AnimatorControl.prototype.CreateLayerAnim = (layer, id, anim) => {
    return  { layer:layer, id:id, anim:this.entity.animation.data.animations[anim] };
};

AnimatorControl.prototype.CreateSkeleton = function(rootBone, skinMesh, targetBones) {
    let boneGraph = skinMesh.model.model.getGraph();
    let rootBoneNodes = boneGraph.findByName(rootBone);
    var bones = { };
    var thisGraph = [];
    var skins = skinMesh.model.model.skinInstances;
    
    for(var s = 0; s < skins.length; s++) {
        for(var b = 0; b < skins[s].bones.length; b++) {
            bones[skins[s].bones[b].name] = skins[s].bones[b];
        }
    }
    
    for(let index in targetBones) {
        let boneNode = targetBones[index];
        for(let xindex in bones) {
            let bone = bones[xindex];
            if(bone.name==boneNode) {
                thisGraph.push(bone);
            }
        }
    }
    
    let rootBoneSkeleton = new pc.Skeleton(rootBoneNodes);
    rootBoneSkeleton.setGraph(rootBoneNodes);
    console.log('skeleton created ',rootBoneSkeleton);
    rootBoneSkeleton.boneGraph = thisGraph;
    return rootBoneSkeleton;
};

AnimatorControl.prototype.CreateAvatarAnim =function(rootBone, targetBones, animObject){
    //create a new skeleton and set it to the skinned mesh entity
    //set its graph to the nodes from the spine and further down
    let thisSkeleton = this.CreateSkeleton(rootBone, this.skinnedMesh, targetBones);
    //set its new animation clip which will only contain relevant nodes to the spine and further down
    this.layerSkeletonAnimClip = new pc.Animation();
    //grab the nodes from the animation
    const layerSkeletonNodes = animObject.anim._nodes;
    // //Filter the animation nodes into a new array to be added into the new animation clip array
    var relevantFilteredNodes = layerSkeletonNodes.filter(function(node){
    for(var index in targetBones) {
        let skelNode = targetBones[index];
        if(node._name==skelNode) {
            return node;
        }
    }
    });
    // //Loop through our filtered nodes and add the filtered animation nodes into the new animation clip
    for(let index in relevantFilteredNodes) {
        let node = relevantFilteredNodes[index];
        if(index!="binaryIndexOf"){
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
        this.app.on(animObject.id,()=>{
            if(Math.abs(thisSkeleton.currentTime, thisSkeleton.animation.duration)<0.01) {
                thisSkeleton.updateAnim=!thisSkeleton.updateAnim;
            }
        });
    return thisSkeleton;
};

AnimatorControl.prototype.TriggerAnim = function(id) {
    this.layers.find((layer)=> {
       if(layer.id==id) {
           layer.updateAnim=!layer.updateAnim;
       } 
    });
};

// update code called every frame
AnimatorControl.prototype.postUpdate = function(dt) {
        
    for(let index in this.layers) {
        let skeletonLayer = this.layers[index];
        // console.log(skeletonLayer);
        if(skeletonLayer.updateAnim)  {
            skeletonLayer.addTime(dt*2);
            skeletonLayer.updateGraph();
            if(Math.abs(skeletonLayer.currentTime, skeletonLayer.animation.duration)<0.01) {
                skeletonLayer.updateAnim=false;
            }
        }
    }
};

