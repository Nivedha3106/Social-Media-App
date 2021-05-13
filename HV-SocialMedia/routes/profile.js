const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');

// @route GET profile
router.get('/getProfile',auth,async (req,res) => {
    try{
        const profile =await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if(!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// route POST postProfile
// create or update user profiles
router.post('/postProfile',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        experience,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    // Build profile
    const profileFields = {};
    profileFields.user = req.user.id;
    
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(experience) profileFields.experience = experience;
    if(skills) {
        // console.log(123);
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social 
    profileFields.social = {} 
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter =twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // Build education
    profileFields.education = {} 
    if (school) profileFields.education.school = school;
    if (degree) profileFields.education.degree = degree;
    if (fieldofstudy) profileFields.education.fieldofstudy = fieldofstudy;
    if (from) profileFields.education.from = from;
    if (to) profileFields.education.to = to;
    if (current) profileFields.education.current = current;
    if (description) profileFields.education.description= description;

    try{
        let profile =await Profile.findOne({user: req.user.id});

        if(profile){
            // update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                {$set:profileFields},
                {new: true}
            );
            return res.json(profile);
        }

        // Create profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    }catch(err) {
        console.error(err.message);
        res.send(500).send('Server Error');
    }

    res.send('Haii');
})

// route GET all profiles 
router.get('/indexProfile', async (req,res) => {
    try{
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// route GET profiles by :user_id
router.get('/indexProfile/user/:user_id', async (req,res) => {
    try{
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user',['name','avatar']);
        res.json(profile);

        if(!profile) return res.status(400).json({msg: 'There is no profile for this user'});
    } catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not Found'});
        }
        res.status(500).send('Server Error');
    }
});

// route DELETE  profile,user & posts
router.delete('/deleteProfile', auth, async (req,res) => {
    try{

        // delete profile
        await Profile.findOneAndRemove({ user: req.user.id});
        // delete user
        await User.findOneAndRemove({ _id: req.user.id});

        res.json({msg: 'User deleted'});
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
