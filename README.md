# PlayCanvas Animator

This is a useful animator script that can be used similar fashion to the AvatarMask and Layers on Unity3d. 

## Usage

You can use this script by solely altering attributes and then simply hooking in to the PlayCanvas event system to interact with your new SkeletonBlend.

[Insert Screenshot of Attributes]

Just alter these attributes based on your model. You can do that by sending this event (which will log your bone structure):

```
this.app.fire('bones:list');
```

Note that this will only work if the script is correctly attached to a MeshComponent and has the SkinnedMesh attribute ascribed.

## Examples

```
TODO: Alter Default PlayCanvas Animation Blending Code to Work For This
```
